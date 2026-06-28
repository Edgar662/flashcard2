import type { QueryClient, QueryKey } from '@tanstack/react-query'

export interface ListMutationContext<T> {
  queryKey: QueryKey
  previous: T[] | undefined
}

/**
 * Optimistic update/delete helpers for TanStack Query list caches, shared
 * by the decks and cards mutations (ADR-0020) — both update/patch a single
 * item, by id, in an already-cached array. Factored out rather than
 * duplicated across four near-identical mutation hooks.
 */

export async function optimisticListPatch<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
  patch: Partial<T>,
): Promise<ListMutationContext<T>> {
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<T[]>(queryKey)
  queryClient.setQueryData<T[]>(queryKey, (old) =>
    old?.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  )
  return { queryKey, previous }
}

export async function optimisticListRemove<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
): Promise<ListMutationContext<T>> {
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<T[]>(queryKey)
  queryClient.setQueryData<T[]>(queryKey, (old) => old?.filter((item) => item.id !== id))
  return { queryKey, previous }
}

/** Restores a list query's cache to what it was before an optimistic update. */
export function rollbackList<T>(
  queryClient: QueryClient,
  context: ListMutationContext<T> | undefined,
): void {
  if (context) queryClient.setQueryData(context.queryKey, context.previous)
}
