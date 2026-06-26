import type { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'

/** Composes every app-wide provider in one place, in the order they nest. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
