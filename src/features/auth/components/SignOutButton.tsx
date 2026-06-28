import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSignOut } from '../hooks/useSignOut'

export function SignOutButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signOut = useSignOut()

  function handleClick() {
    signOut.mutate(undefined, {
      onSuccess: () => void navigate('/login', { replace: true }),
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={signOut.isPending}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {signOut.isPending ? t('common.loading') : t('auth.signOut')}
    </button>
  )
}
