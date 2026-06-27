import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '@/features/cards/api/cardsApi'
import { decksApi } from '../api/decksApi'

export function useDeleteDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    // Cascade delete, matching the documented decks -> cards FK behavior
    // (docs/07-database-design.md). Orchestrated here rather than inside
    // either repository, since it spans two independent entities — see
    // docs/04-architecture.md §Feature layer.
    mutationFn: async (id: string) => {
      await cardsApi.removeByDeck(id)
      await decksApi.remove(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
      void queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
