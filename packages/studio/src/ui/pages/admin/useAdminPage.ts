import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useAccessPolicy,
  useAccessRequests,
  useAdminOverview,
  useDenyRequest,
  useGrantRequest,
  useSaveAccess,
} from "@/hooks/useAccess";
import { useIdentity } from "@/hooks/useIdentity";
import { useNodes } from "@/hooks/useNodes";
import { useMergeProposal, useProposalDetail, useProposals } from "@/hooks/useProposals";
import type { ApiError } from "@/services/httpClient";

import { toDraft, type AccessDraft } from "./utils";

/** All Admin-page state, queries, and mutation handlers. `index.tsx` is purely presentational off this. */
export function useAdminPage() {
  const identity = useIdentity();
  const nodes = useNodes();
  const policy = useAccessPolicy(true);
  const overview = useAdminOverview(true);
  const requests = useAccessRequests(true);
  const proposals = useProposals(true);

  const saveAccess = useSaveAccess();
  const grantRequest = useGrantRequest();
  const denyRequest = useDenyRequest();
  const mergeProposal = useMergeProposal();

  // Access-policy draft, reseeded whenever the loaded policy changes underneath us.
  const [draft, setDraft] = useState<AccessDraft | null>(null);
  useEffect(() => {
    if (policy.data) setDraft(toDraft(policy.data));
  }, [policy.data]);

  // Proposal review: one expanded row at a time; its live diff is fetched on expand.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const detail = useProposalDetail(expandedId);

  const myEmail = identity.data?.actor.email ?? "";

  const onSaveAccess = (): void => {
    if (!draft) return;
    const admins = draft.admins.map((a) => a.trim()).filter(Boolean);
    const users = draft.users.map((u) => ({ email: u.email.trim(), scopes: u.scopes })).filter((u) => u.email);
    if (admins.length === 0) {
      toast.error("At least one admin is required.");
      return;
    }
    if (
      !admins.includes(myEmail) &&
      !window.confirm(`You (${myEmail}) are not in the admins list — you'll lose admin access after saving. Continue?`)
    ) {
      return;
    }
    void saveAccess
      .mutateAsync({ admins, users, defaultScopes: draft.defaultScopes })
      .then(() => toast.success("Saved access policy"))
      .catch((err: ApiError) => toast.error(err.message));
  };

  const onGrant = (id: string, scopes: string[][]): void => {
    void grantRequest
      .mutateAsync({ id, scopes })
      .then(() => toast.success("Granted access"))
      .catch((err: ApiError) => toast.error(err.message));
  };

  const onDeny = (id: string): void => {
    void denyRequest
      .mutateAsync(id)
      .then(() => toast.success("Denied request"))
      .catch((err: ApiError) => toast.error(err.message));
  };

  const onToggleProposal = (id: string): void => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const onMerge = (id: string): void => {
    void mergeProposal
      .mutateAsync(id)
      .then(() => toast.success(`Merged ${id}`))
      .catch((err: ApiError) => {
        const body = err.body as { conflicts?: unknown[] } | undefined;
        if (err.status === 409 && Array.isArray(body?.conflicts)) {
          toast.error(
            `Cannot merge — ${String(body.conflicts.length)} conflict(s); the author must sync + resolve first`,
          );
        } else {
          toast.error(err.message);
        }
      });
  };

  return {
    identity: identity.data,
    nodes: nodes.data ?? [],
    policy: policy.data,
    overview: overview.data,
    overviewLoading: overview.isLoading,
    requests: requests.data,
    requestsLoading: requests.isLoading,
    proposals: proposals.data,
    proposalsLoading: proposals.isLoading,
    draft,
    setDraft,
    onSaveAccess,
    saving: saveAccess.isPending,
    onGrant,
    onDeny,
    grantOrDenyPending: grantRequest.isPending || denyRequest.isPending,
    expandedId,
    onToggleProposal,
    detail: detail.data,
    detailLoading: detail.isLoading,
    onMerge,
    merging: mergeProposal.isPending,
  };
}
