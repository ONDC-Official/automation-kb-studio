import httpClient from "@/services/httpClient";
import type { Topic } from "@/services/types";
import { encodeRef } from "@/lib/ref";
import { usePost } from "./usePost";
import { manifestKeys } from "./useManifest";
import { nodeKeys } from "./useNodes";

/**
 * Save a topic. `previous` renames (the server moves the old file); `baseVersion` is the optimistic-
 * concurrency token — a stale save 409s with `{ current, currentVersion }` on the ApiError body, which
 * the author page reads to raise a conflict banner. Autosave orchestration (debounce, per-editor
 * conflict tracking) lives in the page hook; this is just the write.
 */
export interface SaveTopicVars {
  topic: Topic;
  previous?: { path: string[]; id: string };
  baseVersion?: string | null;
}

export function useSaveTopic() {
  return usePost<{ version?: string }, SaveTopicVars>(
    async ({ topic, previous, baseVersion }) => {
      const body: Record<string, unknown> = { topic };
      if (previous) body["previous"] = previous;
      if (baseVersion) body["baseVersion"] = baseVersion;
      return (await httpClient.post<{ version?: string }>("/api/topics", body)).data;
    },
    { invalidates: [manifestKeys.all, nodeKeys.all] },
  );
}

export function useDeleteTopic() {
  return usePost<unknown, { path: string[]; id: string }>(
    async ({ path, id }) => (await httpClient.delete<unknown>(`/api/topics/${encodeRef(...path, id)}`)).data,
    { invalidates: [manifestKeys.all, nodeKeys.all] },
  );
}
