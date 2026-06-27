import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '../api/cardsApi'

/** Total cards across every deck — used by the Home dashboard. */
export function useTotalCardCount() {
  return useQuery({
    queryKey: ['cards', 'count-all'],
    queryFn: () => cardsApi.countAll(),
  })
}
