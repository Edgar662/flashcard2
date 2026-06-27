import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '../api/cardsApi'
import type { UpdateCardInput } from '../types'

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCardInput }) =>
      cardsApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
