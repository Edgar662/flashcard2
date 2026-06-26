import { createContext } from 'react'
import type { Session, User } from '@/lib/supabaseClient'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
