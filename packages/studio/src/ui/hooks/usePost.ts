import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

import type { ApiError } from "@/services/httpClient";

interface MutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn"> {
  /** Query keys to invalidate on success. */
  invalidates?: QueryKey[];
}

/** Thin typed wrapper over `useMutation` with a declarative `invalidates` list. */
export function usePost<TData, TVariables = void>(
  mutator: (variables: TVariables) => Promise<TData>,
  { invalidates, ...options }: MutationOptions<TData, TVariables> = {},
) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: mutator,
    ...options,
    onSuccess: (...args: Parameters<NonNullable<typeof options.onSuccess>>) => {
      invalidates?.forEach((key) => void queryClient.invalidateQueries({ queryKey: key }));
      options.onSuccess?.(...args);
    },
  });
}
