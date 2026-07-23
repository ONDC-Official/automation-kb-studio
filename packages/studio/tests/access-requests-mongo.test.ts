/**
 * The "request access" flow (multi-user): a viewer files a request naming path(s), an admin grants
 * (promoting the viewer to a scoped author) or denies, and the queue/whoami surfaces reflect it.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { AccessRequest } from "../src/ui/types";
import { reqAs, startStudio, teardown } from "./server-helper";
import { startMongo, stopMongo } from "./mongo-helper";

beforeAll(startMongo, 60_000);
afterAll(stopMongo);
afterEach(teardown);

const ADMIN = "admin@corp.com";
const VIEWER = "viewer@corp.com";

interface Whoami {
  role: string;
  scopes: string[][];
  accessRequest: AccessRequest | null;
  pendingRequests: number;
}

/** A multi-user studio with one admin and an otherwise-viewer default. */
function studio(): ReturnType<typeof startStudio> {
  return startStudio({ multiUser: true, access: { admins: [ADMIN] } });
}

describe("KB Studio — request access", () => {
  it("a viewer files a request that shows in the admin queue", async () => {
    const s = await studio();
    const submit = await reqAs<AccessRequest>(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["protocol"]], note: "need protocol" });
    expect(submit.status).toBe(200);
    expect(submit.json).toMatchObject({ email: VIEWER, status: "pending", paths: [["protocol"]], note: "need protocol" });

    const queue = await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests");
    expect(queue.status).toBe(200);
    expect(queue.json.requests).toHaveLength(1);
    expect(queue.json.requests[0]).toMatchObject({ email: VIEWER, note: "need protocol" });

    // The viewer's whoami advertises their own pending request; the admin sees the queue depth.
    const vme = await reqAs<Whoami>(s.base, VIEWER, "GET", "/api/whoami");
    expect(vme.json.role).toBe("viewer");
    expect(vme.json.accessRequest?.status).toBe("pending");
    const ame = await reqAs<Whoami>(s.base, ADMIN, "GET", "/api/whoami");
    expect(ame.json.pendingRequests).toBe(1);
  });

  it("rejects an empty request and refuses an admin's own request", async () => {
    const s = await studio();
    const empty = await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [] });
    expect(empty.status).toBe(400);
    const adminReq = await reqAs(s.base, ADMIN, "POST", "/api/access-requests", { paths: [["protocol"]] });
    expect(adminReq.status).toBe(400);
  });

  it("gates the queue and decisions to admins", async () => {
    const s = await studio();
    await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["protocol"]] });
    const id = (await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests")).json.requests[0]!.id;

    expect((await reqAs(s.base, VIEWER, "GET", "/api/access-requests")).status).toBe(403);
    expect((await reqAs(s.base, VIEWER, "POST", `/api/access-requests/${id}/grant`, {})).status).toBe(403);
    expect((await reqAs(s.base, VIEWER, "POST", `/api/access-requests/${id}/deny`, {})).status).toBe(403);
  });

  it("granting promotes the viewer to a scoped author and clears the request", async () => {
    const s = await studio();
    await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["protocol"]] });
    const id = (await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests")).json.requests[0]!.id;

    const grant = await reqAs<{ ok: boolean; request: AccessRequest }>(s.base, ADMIN, "POST", `/api/access-requests/${id}/grant`, {});
    expect(grant.status).toBe(200);
    expect(grant.json.request.status).toBe("granted");

    // The requester is now an author scoped to the granted path.
    const vme = await reqAs<Whoami>(s.base, VIEWER, "GET", "/api/whoami");
    expect(vme.json.role).toBe("author");
    expect(vme.json.scopes).toEqual([["protocol"]]);
    expect(vme.json.accessRequest).toBeNull();

    // The policy carries the new scoped user, and the queue is empty.
    const access = await reqAs<{ users: { email: string; scopes: string[][] }[] }>(s.base, ADMIN, "GET", "/api/access");
    expect(access.json.users).toContainEqual({ email: VIEWER, scopes: [["protocol"]] });
    expect((await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests")).json.requests).toHaveLength(0);
  });

  it("an admin can override the requested scopes when granting", async () => {
    const s = await studio();
    await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["protocol"]] });
    const id = (await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests")).json.requests[0]!.id;
    await reqAs(s.base, ADMIN, "POST", `/api/access-requests/${id}/grant`, { scopes: [["retail"]] });

    const vme = await reqAs<Whoami>(s.base, VIEWER, "GET", "/api/whoami");
    expect(vme.json.scopes).toEqual([["retail"]]);
  });

  it("denying clears the request without granting scopes; a second decision 404s", async () => {
    const s = await studio();
    await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["protocol"]] });
    const id = (await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests")).json.requests[0]!.id;

    expect((await reqAs(s.base, ADMIN, "POST", `/api/access-requests/${id}/deny`, {})).status).toBe(200);
    const vme = await reqAs<Whoami>(s.base, VIEWER, "GET", "/api/whoami");
    expect(vme.json.role).toBe("viewer");
    expect(vme.json.accessRequest).toBeNull();
    // Deciding an already-resolved request is a no-op 404 (guards against a double click).
    expect((await reqAs(s.base, ADMIN, "POST", `/api/access-requests/${id}/grant`, {})).status).toBe(404);
  });

  it("re-submitting keeps a single pending request (upsert)", async () => {
    const s = await studio();
    await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["protocol"]], note: "first" });
    await reqAs(s.base, VIEWER, "POST", "/api/access-requests", { paths: [["retail"]], note: "second" });

    const queue = await reqAs<{ requests: AccessRequest[] }>(s.base, ADMIN, "GET", "/api/access-requests");
    expect(queue.json.requests).toHaveLength(1);
    expect(queue.json.requests[0]).toMatchObject({ paths: [["retail"]], note: "second" });
  });
});
