import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/Logo'
import { MobileDrawer } from './MobileDrawer'

/** Top bar shown only below the lg breakpoint, opening MobileDrawer. */
export function MobileNav() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between border-b border-border p-4 lg:hidden">
        <Logo />
        <button
          type="button"
          aria-label={t('nav.openMenu')}
          onClick={() => setIsOpen(true)}
          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>
      <MobileDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
