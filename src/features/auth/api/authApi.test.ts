import { describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({ supabase: { auth } }))

import { authApi } from './authApi'

describe('authApi', () => {
  it('signIn returns the session on success', async () => {
    const session = { access_token: 'token' }
    auth.signInWithPassword.mockResolvedValueOnce({ data: { session, user: null }, error: null })

    const result = await authApi.signIn('a@example.com', 'hunter2')

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@example.com',
      password: 'hunter2',
    })
    expect(result).toBe(session)
  })

  it('signIn throws the Supabase error on failure', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    })

    await expect(authApi.signIn('a@example.com', 'wrong')).rejects.toEqual({
      message: 'Invalid login credentials',
    })
  })

  it('signUp returns a session when email confirmation is disabled', async () => {
    const session = { access_token: 'token' }
    auth.signUp.mockResolvedValueOnce({ data: { session, user: null }, error: null })

    const result = await authApi.signUp('a@example.com', 'hunter2')

    expect(result).toEqual({ session })
  })

  it('signUp returns a null session when email confirmation is required', async () => {
    auth.signUp.mockResolvedValueOnce({ data: { session: null, user: null }, error: null })

    const result = await authApi.signUp('a@example.com', 'hunter2')

    expect(result).toEqual({ session: null })
  })

  it('signOut throws on failure', async () => {
    auth.signOut.mockResolvedValueOnce({ error: { message: 'network error' } })

    await expect(authApi.signOut()).rejects.toEqual({ message: 'network error' })
  })
})
