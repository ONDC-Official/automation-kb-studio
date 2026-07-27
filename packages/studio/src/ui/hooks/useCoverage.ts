import httpClient from "@/services/httpClient";
import type { CoverageReportWithTree, CoverageSummary } from "@/services/types";
import { useGet } from "./useGet";

export const coverageKeys = {
  runs: ["coverage-runs"] as const,
  report: (file: string) => ["coverage-report", file] as const,
};

/** The list of stored coverage runs (newest first). */
export function useCoverageRuns() {
  return useGet<CoverageSummary[]>(
    coverageKeys.runs,
    async () => (await httpClient.get<CoverageSummary[]>("/api/coverage")).data,
  );
}

/** One run's full report + per-level tree rollup. React Query dedups concurrent loads of the same file. */
export function useCoverageReport(file: string | null | undefined) {
  return useGet<CoverageReportWithTree>(
    coverageKeys.report(file ?? ""),
    async () =>
      (await httpClient.get<CoverageReportWithTree>(`/api/coverage/${encodeURIComponent(file ?? "")}?tree=1`)).data,
    { enabled: Boolean(file) },
  );
}
