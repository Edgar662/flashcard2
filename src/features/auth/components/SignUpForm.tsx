import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'
import { useSignUp } from '../hooks/useSignUp'

interface SignUpFormValues {
  email: string
  password: string
}

/**
 * Self-contained, same shape as LoginForm. Supabase's `signUp` returns a
 * session immediately only if the project has email confirmation disabled;
 * otherwise it returns no session and an email is sent instead — this
 * component handles both outcomes rather than assuming one. See
 * docs/10-authentication.md.
 */
export function SignUpForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signUp = useSignUp()
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)

  const signUpSchema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('auth.emailRequired')).email(t('auth.emailInvalid')),
        password: z.string().min(6, t('auth.passwordTooShort')),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) })

  function onSubmit(values: SignUpFormValues) {
    signUp.mutate(values, {
      onSuccess: ({ session }) => {
        if (session) {
          void navigate('/', { replace: true })
        } else {
          setConfirmationSentTo(values.email)
        }
      },
    })
  }

  if (confirmationSentTo) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.confirmEmailSent', { email: confirmationSentTo })}
      </p>
    )
  }

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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {signUp.isError && <p className="text-sm text-destructive">{t('auth.signUpFailed')}</p>}
      <Button type="submit" className="w-full" disabled={signUp.isPending}>
        {signUp.isPending ? t('auth.creatingAccount') : t('auth.createAccount')}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  )
}
