import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '../api/cardsApi'

export function useCards(deckId: string) {
  return useQuery({
    queryKey: ['cards', 'deck', deckId],
    queryFn: () => cardsApi.listByDeck(deckId),
  })
}
