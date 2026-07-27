import httpClient from "@/services/httpClient";
import type { Proposal, ProposalDetail, SyncResult } from "@/services/types";
import { useGet } from "./useGet";
import { usePost } from "./usePost";
import { manifestKeys } from "./useManifest";
import { nodeKeys } from "./useNodes";

export const proposalKeys = {
  list: ["proposals"] as const,
  detail: (id: string) => ["proposal", id] as const,
};

/** The review queue (admins see all; an author sees their own). `enabled` gates it to when the panel is open. */
export function useProposals(enabled: boolean) {
  return useGet<Proposal[]>(
    proposalKeys.list,
    async () => (await httpClient.get<{ proposals: Proposal[] }>("/api/proposals")).data.proposals,
    { enabled },
  );
}

/** The full live diff for one proposal, fetched on expand (admin review). */
export function useProposalDetail(id: string | null) {
  return useGet<ProposalDetail>(
    proposalKeys.detail(id ?? ""),
    async () => (await httpClient.get<ProposalDetail>(`/api/proposals/${encodeURIComponent(id ?? "")}`)).data,
    { enabled: Boolean(id) },
  );
}

export function useSubmitProposal() {
  return usePost<Proposal, string | undefined>(
    async (note) => (await httpClient.post<Proposal>("/api/proposals", note ? { note } : {})).data,
    { invalidates: [proposalKeys.list] },
  );
}

export function useWithdrawProposal() {
  return usePost<unknown, void>(
    async () => (await httpClient.delete<unknown>("/api/proposals")).data,
    { invalidates: [proposalKeys.list] },
  );
}

export function useMergeProposal() {
  return usePost<unknown, string>(
    async (id) => (await httpClient.post<unknown>(`/api/proposals/${encodeURIComponent(id)}/merge`, {})).data,
    { invalidates: [proposalKeys.list, manifestKeys.all, nodeKeys.all] },
  );
}

/** Pull main into the author's workspace. Returns conflicts to resolve (if any). */
export function useSync() {
  return usePost<SyncResult, void>(
    async () => (await httpClient.post<SyncResult>("/api/sync", {})).data,
    { invalidates: [manifestKeys.all, nodeKeys.all] },
  );
}

export function useResolveSyncConflict() {
  return usePost<unknown, { key: string; choose: "mine" | "theirs" }>(
    async (body) => (await httpClient.post<unknown>("/api/sync/resolve", body)).data,
    { invalidates: [manifestKeys.all, nodeKeys.all] },
  );
}
