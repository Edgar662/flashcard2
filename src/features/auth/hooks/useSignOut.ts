import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.signOut(),
    // Without this, a second user signing in on the same tab (after the
    // first signs out, no page reload in between) could briefly see the
    // previous user's cached decks/cards before queries refetch — RLS means
    // the refetched data is always correct, but the stale flash isn't.
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
