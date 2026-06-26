import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

/**
 * Owns the TanStack Query client. Per docs/04-architecture.md §State
 * management, this is the only mechanism for server state in the app —
 * no global client-state library is used alongside it (see ADR-0005).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
