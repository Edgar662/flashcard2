import { useTranslation } from 'react-i18next'

/**
 * Placeholder sign-up route, linked from LoginForm's "Create account".
 * The real sign-up form belongs to the `auth` feature, built alongside
 * the real sign-in flow — see docs/10-authentication.md.
 */
export function SignUpPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{t('auth.createAccountComingSoon')}</p>
    </div>
  )
}
