import { Logo } from '@/components/Logo'
import { SidebarNavLinks } from './SidebarNavLinks'

/** Fixed desktop sidebar — hidden below the lg breakpoint in favor of MobileNav's drawer. */
export function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-background lg:p-4">
      <Logo className="mb-6 px-2" />
      <SidebarNavLinks />
    </aside>
  )
}
