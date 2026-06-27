import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

/** Shell for every authenticated-feeling page: fixed sidebar on desktop, drawer on mobile. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-60">
        <Outlet />
      </main>
    </div>
  )
}
