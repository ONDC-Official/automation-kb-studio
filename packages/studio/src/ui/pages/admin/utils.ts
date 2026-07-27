import type { AccessPolicyView, NodeInfo } from "@/services/types";

/** The editable half of the access policy (everything but the read-only `configured` flag). */
export type AccessDraft = Omit<AccessPolicyView, "configured">;

/** A scope is a path prefix; `[]` means the root (everything). */
export const scopeLabel = (s: string[]): string => (s.length ? s.join(" / ") : "root · everything");

export const scopeKey = (s: string[]): string => s.join(" ");

/** Node paths (+ root) not already present in `scopes` — the pickable "add scope" options. */
export function availableScopes(scopes: string[][], nodes: NodeInfo[]): string[][] {
  const have = new Set(scopes.map(scopeKey));
  return [[] as string[], ...nodes.map((n) => n.path)].filter((p) => !have.has(scopeKey(p)));
}

/** Deep-copy the policy into an editable draft so edits never mutate the query cache. */
export function toDraft(p: AccessPolicyView): AccessDraft {
  return {
    admins: [...p.admins],
    users: p.users.map((u) => ({ email: u.email, scopes: u.scopes.map((s) => [...s]) })),
    defaultScopes: p.defaultScopes.map((s) => [...s]),
  };
}
