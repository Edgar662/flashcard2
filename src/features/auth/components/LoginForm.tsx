import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'

export interface LoginFormValues {
  email: string
  password: string
}

interface LoginFormProps {
  /**
   * Called with the validated form values. Today this only drives a
   * simulated navigation (see docs/13-roadmap.md) — wiring it to a real
   * `authApi.signIn` call later does not require changing this component.
   */
  onSubmit: (values: LoginFormValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { t } = useTranslation()

  // Rebuilt whenever the language changes, so already-visible validation
  // messages switch language immediately rather than staying stale.
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('auth.emailRequired')).email(t('auth.emailInvalid')),
        password: z.string().min(1, t('auth.passwordRequired')),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label={t('auth.password')}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full">
        {t('auth.signIn')}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.createAccount')}
        </Link>
      </p>
    </form>
  )
}
