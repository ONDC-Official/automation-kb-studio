/**
 * The "request access" queue — a viewer's ask for write scopes and the admin's grant/deny of it.
 *
 * A viewer has no write scopes (read-only). Here they file a request naming the taxonomy path(s) they
 * want to edit; an admin then GRANTS it (the server merges those scopes into the canonical
 * `config.access` policy — see `access-store.ts` — promoting the requester to an author) or DENIES it.
 * This module owns only the queue's Mongo I/O (submit/list/get/resolve); applying a grant to the policy
 * is the server's job, under the write mutex.
 *
 * Invariant: at most ONE `pending` request per email (a partial-unique index enforces it), so a second
 * submit UPSERTS the open request rather than piling up duplicates.
 */
import type { Actor } from "./actor";
import type { AccessRequestDoc, DbHandle } from "./db";
import { ObjectId } from "./db";

/** A request as the UI lists it (dates as ISO strings; `_id` hex as the stable `id`). */
export interface AccessRequestView {
  id: string;
  email: string;
  name: string;
  paths: string[][];
  note: string | null;
  status: "pending" | "granted" | "denied";
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
}

function toView(doc: AccessRequestDoc): AccessRequestView {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    paths: doc.paths,
    note: doc.note,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    decidedAt: doc.decidedAt ? doc.decidedAt.toISOString() : null,
    decidedBy: doc.decidedBy,
  };
}

/**
 * File (or replace) the caller's open request. Upserts the single `pending` document for `actor.email`,
 * so re-submitting just updates the paths/note. Returns the stored request.
 */
export async function submitRequest(db: DbHandle, actor: Actor, paths: string[][], note: string | null): Promise<AccessRequestView> {
  const now = new Date();
  const doc = await db.accessRequests.findOneAndUpdate(
    { email: actor.email, status: "pending" },
    {
      $set: { name: actor.name, paths, note, decidedAt: null, decidedBy: null },
      $setOnInsert: { _id: new ObjectId(), email: actor.email, status: "pending", createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (!doc) throw new Error("failed to record the access request");
  return toView(doc);
}

/** The caller's own open request, or null — surfaced in `whoami` so the UI can show a "requested" state. */
export async function pendingFor(db: DbHandle, email: string): Promise<AccessRequestView | null> {
  const doc = await db.accessRequests.findOne({ email, status: "pending" });
  return doc ? toView(doc) : null;
}

/** How many requests are awaiting a decision — drives the admin's badge. */
export function countPending(db: DbHandle): Promise<number> {
  return db.accessRequests.countDocuments({ status: "pending" });
}

/** The open queue, oldest first (admins). */
export async function listPending(db: DbHandle): Promise<AccessRequestView[]> {
  const docs = await db.accessRequests.find({ status: "pending" }).sort({ createdAt: 1 }).toArray();
  return docs.map(toView);
}

/** One request by id, or null when the id is malformed or absent. */
export async function getRequest(db: DbHandle, id: string): Promise<AccessRequestView | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await db.accessRequests.findOne({ _id: new ObjectId(id) });
  return doc ? toView(doc) : null;
}

/**
 * Record an admin's decision on a still-pending request. Returns the resolved request, or null when it
 * isn't there / was already decided (so a double-click can't grant twice). The caller applies the policy
 * change (on a grant) separately, under the mutex.
 */
export async function resolveRequest(db: DbHandle, id: string, decision: "granted" | "denied", admin: Actor): Promise<AccessRequestView | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await db.accessRequests.findOneAndUpdate(
    { _id: new ObjectId(id), status: "pending" },
    { $set: { status: decision, decidedAt: new Date(), decidedBy: admin.email } },
    { returnDocument: "after" },
  );
  return doc ? toView(doc) : null;
}
