import { supabase, type Session } from '@/lib/supabaseClient'

/**
 * All authentication goes exclusively through the official Supabase client
 * (no custom token handling) — see docs/10-authentication.md and ADR-0009.
 * `AuthProvider` (src/app/providers) consumes the resulting session reactively
 * via `supabase.auth.onAuthStateChange`, so these functions don't need to
 * update any app state themselves; they just perform the operation.
 */
export interface AuthRepository {
  signIn(email: string, password: string): Promise<Session>
  /** Returns the new session if email confirmation is disabled, or null if a confirmation email was sent instead. */
  signUp(email: string, password: string): Promise<{ session: Session | null }>
  signOut(): Promise<void>
}

export const authApi: AuthRepository = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.session
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return { session: data.session }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}
