import httpClient from "@/services/httpClient";
import type { EvalRunDetail, EvalRunSummary, ResumeRequest, RunRequest } from "@/services/types";
import { useGet } from "./useGet";
import { usePost } from "./usePost";

export const runKeys = {
  list: ["eval-runs"] as const,
  detail: (id: string) => ["eval-run", id] as const,
};

/** The user's eval runs. Polls every 1.5s while any run is still running (live progress). */
export function useEvalRuns(enabled: boolean) {
  return useGet<EvalRunSummary[]>(
    runKeys.list,
    async () => (await httpClient.get<{ runs: EvalRunSummary[] }>("/api/runs")).data.runs,
    {
      enabled,
      refetchInterval: (query) =>
        query.state.data?.some((r) => r.status === "running") ? 1500 : false,
    },
  );
}

/** One run's detail (live activity feed + embedded report once finished). Polls while it's running. */
export function useEvalRun(id: string | null) {
  return useGet<EvalRunDetail>(
    runKeys.detail(id ?? ""),
    async () => (await httpClient.get<EvalRunDetail>(`/api/runs/${encodeURIComponent(id ?? "")}`)).data,
    {
      enabled: Boolean(id),
      refetchInterval: (query) => (query.state.data?.status === "running" ? 1500 : false),
    },
  );
}

export function useStartRun() {
  return usePost<{ id: string }, RunRequest>(
    async (req) => (await httpClient.post<{ id: string }>("/api/runs", req)).data,
    { invalidates: [runKeys.list] },
  );
}

export function usePauseRun() {
  return usePost<unknown, string>(
    async (id) => (await httpClient.post<unknown>(`/api/runs/${encodeURIComponent(id)}/pause`, {})).data,
    { invalidates: [runKeys.list] },
  );
}

export function useResumeRun() {
  return usePost<unknown, { id: string; req: ResumeRequest }>(
    async ({ id, req }) => (await httpClient.post<unknown>(`/api/runs/${encodeURIComponent(id)}/resume`, req)).data,
    { invalidates: [runKeys.list] },
  );
}

export function useDeleteRun() {
  return usePost<unknown, string>(
    async (id) => (await httpClient.delete<unknown>(`/api/runs/${encodeURIComponent(id)}`)).data,
    { invalidates: [runKeys.list] },
  );
}
