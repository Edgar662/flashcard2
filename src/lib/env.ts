type RequiredEnvVar = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY'

function readEnvVar(key: RequiredEnvVar): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`${key} is required — see .env.example`)
  }
  return value
}

/**
 * Validated environment variables. Read once, at import time, so a
 * misconfigured environment fails fast with a clear message instead of
 * surfacing as a confusing error deep inside the Supabase client later.
 *
 * Deliberately plain checks, not a Zod schema: this is the one place Zod
 * would run on every page load regardless of route (env.ts is imported by
 * supabaseClient.ts, which AuthProvider needs eagerly), pulling Zod's ~25kB
 * into the main bundle for two non-empty-string checks. Zod is still used
 * for actual form validation (LoginForm, DeckFormDialog, CardFormDialog),
 * where it's lazy-loaded with the route that needs it — see ADR-0019.
 */
export const env = {
  VITE_SUPABASE_URL: readEnvVar('VITE_SUPABASE_URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: readEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY'),
}
