import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

export function useSignUp() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signUp(email, password),
  })
}
