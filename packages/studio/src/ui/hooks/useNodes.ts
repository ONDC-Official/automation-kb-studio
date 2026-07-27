import httpClient from "@/services/httpClient";
import type { NodeInfo } from "@/services/types";
import { encodeRef } from "@/lib/ref";
import { useGet } from "./useGet";
import { usePost } from "./usePost";
import { manifestKeys } from "./useManifest";

export const nodeKeys = {
  all: ["nodes"] as const,
};

/** The flat taxonomy node list (DFS/sorted), the spine of the author tree. */
export function useNodes() {
  return useGet<NodeInfo[]>(nodeKeys.all, async () => {
    const { nodes } = (await httpClient.get<{ nodes: NodeInfo[] }>("/api/nodes")).data;
    return nodes;
  });
}

export function useCreateNode() {
  return usePost<unknown, string[]>(
    async (path) => (await httpClient.post<unknown>("/api/nodes", { path })).data,
    { invalidates: [nodeKeys.all] },
  );
}

export function useRenameNode() {
  return usePost<unknown, { from: string[]; to: string[] }>(
    async ({ from, to }) => (await httpClient.put<unknown>(`/api/nodes/${encodeRef(...from)}`, { to })).data,
    { invalidates: [nodeKeys.all, manifestKeys.all] },
  );
}

export function useDeleteNode() {
  return usePost<unknown, { path: string[]; suffix: string }>(
    async ({ path, suffix }) => (await httpClient.delete<unknown>(`/api/nodes/${encodeRef(...path)}${suffix}`)).data,
    { invalidates: [nodeKeys.all, manifestKeys.all] },
  );
}
