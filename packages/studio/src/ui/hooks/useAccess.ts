import httpClient from "@/services/httpClient";
import type { AccessPolicyView, AccessRequest, AdminOverview } from "@/services/types";
import { useGet } from "./useGet";
import { usePost } from "./usePost";
import { identityKeys } from "./useIdentity";

export const accessKeys = {
  policy: ["access-policy"] as const,
  overview: ["admin-overview"] as const,
  requests: ["access-requests"] as const,
};

/** All three are admin-only surfaces, gated to the Admin page via `enabled`. */
export function useAccessPolicy(enabled: boolean) {
  return useGet<AccessPolicyView>(
    accessKeys.policy,
    async () => (await httpClient.get<AccessPolicyView>("/api/access")).data,
    { enabled },
  );
}

export function useAdminOverview(enabled: boolean) {
  return useGet<AdminOverview>(
    accessKeys.overview,
    async () => (await httpClient.get<AdminOverview>("/api/admin/overview")).data,
    { enabled },
  );
}

export function useAccessRequests(enabled: boolean) {
  return useGet<AccessRequest[]>(
    accessKeys.requests,
    async () => (await httpClient.get<{ requests: AccessRequest[] }>("/api/access-requests")).data.requests,
    { enabled },
  );
}

/** Edits the access policy; the caller's own role may change, so whoami is invalidated too. */
export function useSaveAccess() {
  return usePost<unknown, { admins: string[]; users: { email: string; scopes: string[][] }[]; defaultScopes: string[][] }>(
    async (draft) => (await httpClient.put<unknown>("/api/access", draft)).data,
    { invalidates: [accessKeys.policy, accessKeys.overview, identityKeys.whoami] },
  );
}

export function useGrantRequest() {
  return usePost<unknown, { id: string; scopes: string[][] }>(
    async ({ id, scopes }) =>
      (await httpClient.post<unknown>(`/api/access-requests/${encodeURIComponent(id)}/grant`, { scopes })).data,
    { invalidates: [accessKeys.requests, accessKeys.policy, accessKeys.overview, identityKeys.whoami] },
  );
}

export function useDenyRequest() {
  return usePost<unknown, string>(
    async (id) => (await httpClient.post<unknown>(`/api/access-requests/${encodeURIComponent(id)}/deny`, {})).data,
    { invalidates: [accessKeys.requests, identityKeys.whoami] },
  );
}
