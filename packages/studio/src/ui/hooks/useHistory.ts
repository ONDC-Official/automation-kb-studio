import httpClient from "@/services/httpClient";
import type { HistoryData } from "@/services/types";
import { useGet } from "./useGet";

export const historyKeys = {
  all: ["history"] as const,
};

/** Recent commits + recoverable deletions (the History / Trash panel). `enabled` gates it to when open. */
export function useHistory(enabled: boolean) {
  return useGet<HistoryData>(
    historyKeys.all,
    async () => (await httpClient.get<HistoryData>("/api/history")).data,
    { enabled },
  );
}
