import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/providers/useAuth'

/**
 * Route guard used to wrap routes that require a signed-in user. This is a
 * UX nicety, not the security boundary — Row Level Security on the database
 * is what actually enforces access (see docs/10-authentication.md).
 */
export function RequireAuth() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
