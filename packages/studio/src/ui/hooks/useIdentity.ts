import httpClient from "@/services/httpClient";
import type { Identity } from "@/services/types";
import { useGet } from "./useGet";
import { usePost } from "./usePost";

export const identityKeys = {
  whoami: ["whoami"] as const,
};

/**
 * The signed-in user (ambient, cookie/proxy — no login). Refetches on window focus, and polls every 15s
 * while a viewer is waiting on a pending access request, so a mid-session grant (viewer → author) lands
 * without a manual reload. Overrides the global `refetchOnWindowFocus: false` — that's the point of it.
 */
export function useIdentity() {
  return useGet<Identity>(
    identityKeys.whoami,
    async () => (await httpClient.get<Identity>("/api/whoami")).data,
    {
      refetchOnWindowFocus: true,
      refetchInterval: (query) => {
        const id = query.state.data;
        return id?.role === "viewer" && id.accessRequest ? 15_000 : false;
      },
    },
  );
}

/** A viewer asks for write access on some path(s). Refreshes whoami to reflect the new pending state. */
export function useSubmitAccessRequest() {
  return usePost<unknown, { paths: string[][]; note?: string }>(
    async ({ paths, note }) =>
      (await httpClient.post<unknown>("/api/access-requests", note ? { paths, note } : { paths })).data,
    { invalidates: [identityKeys.whoami] },
  );
}
