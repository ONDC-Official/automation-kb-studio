import httpClient from "@/services/httpClient";
import type { Manifest } from "@/services/types";
import { useGet } from "./useGet";
import { usePost } from "./usePost";
import { nodeKeys } from "./useNodes";
import { historyKeys } from "./useHistory";

export const manifestKeys = {
  all: ["manifest"] as const,
};

/** The whole manifest (topics + level labels + per-topic version hashes). */
export function useManifest() {
  return useGet<Manifest>(
    manifestKeys.all,
    async () => (await httpClient.get<Manifest>("/api/manifest")).data,
  );
}

/** Save the manifest identity/levels (`subject` "" unsets it server-side). */
export function useSaveMeta() {
  return usePost<unknown, { id: string; version: string; subject: string; levels: string[] }>(
    async (body) => (await httpClient.put<unknown>("/api/meta", body)).data,
    { invalidates: [manifestKeys.all] },
  );
}

/** Download the manifest as YAML text (a raw-body GET, not JSON). */
export function useExportManifest() {
  return usePost<string, void>(
    async () => (await httpClient.get<string>("/api/export", { responseType: "text" })).data,
  );
}

export function useImportManifest() {
  return usePost<{ topics: number }, string>(
    async (yaml) => (await httpClient.post<{ topics: number }>("/api/import", { yaml })).data,
    { invalidates: [manifestKeys.all, nodeKeys.all, historyKeys.all] },
  );
}

export function useRestoreTopic() {
  return usePost<unknown, { sha: string; path: string[]; id: string }>(
    async (body) => (await httpClient.post<unknown>("/api/restore", body)).data,
    { invalidates: [manifestKeys.all, nodeKeys.all, historyKeys.all] },
  );
}
