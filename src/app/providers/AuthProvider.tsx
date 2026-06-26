import { useEffect, useState, type ReactNode } from 'react'
import { supabase, type Session } from '@/lib/supabaseClient'
import { AuthContext, type AuthContextValue } from './auth-context'

/**
 * Tracks the current Supabase session and exposes it via `useAuth()`.
 * This is infrastructure only — it has no sign-in/sign-up UI or logic.
 * The actual login feature (forms, `authApi.signIn`, etc.) lives in
 * `features/auth` and is built separately — see docs/10-authentication.md.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
