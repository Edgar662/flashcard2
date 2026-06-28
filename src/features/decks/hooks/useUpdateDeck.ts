import { useMutation, useQueryClient } from '@tanstack/react-query'
import { optimisticListPatch, rollbackList } from '@/lib/optimisticList'
import { decksApi } from '../api/decksApi'
import type { Deck, UpdateDeckInput } from '../types'

export function useUpdateDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDeckInput }) =>
      decksApi.update(id, input),
    onMutate: ({ id, input }) => optimisticListPatch<Deck>(queryClient, ['decks'], id, input),
    onError: (_error, _variables, context) => rollbackList(queryClient, context),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}
