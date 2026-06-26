import { Outlet } from 'react-router-dom'

/** App shell — shared chrome around every route. No feature UI lives here. */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  )
}
