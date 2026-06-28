import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers/useAuth'
import { SignOutButton } from '@/features/auth/components/SignOutButton'

/** Bottom-of-sidebar slot: who's signed in, and the way to stop being. Shared by Sidebar and MobileDrawer. */
export function SidebarFooter() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
      {user?.email && (
        <p className="truncate px-3 text-xs text-muted-foreground">
          {t('auth.signedInAs', { email: user.email })}
        </p>
      )}
      <SignOutButton />
    </div>
  )
}
