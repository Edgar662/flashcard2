import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
  })
}
