import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '../api/cardsApi'

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cardsApi.remove(id),
    onSuccess: () => {
      // deckId isn't available post-delete; invalidating broadly is simpler
      // than an extra lookup, and harmless at this app's scale.
      void queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
