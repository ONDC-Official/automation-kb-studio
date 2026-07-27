import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

import type { ApiError } from "@/services/httpClient";

/** Thin typed wrapper over `useQuery` so every read in the app looks the same. */
export function useGet<TData>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, ApiError>({ queryKey: key, queryFn: fetcher, ...options });
}
