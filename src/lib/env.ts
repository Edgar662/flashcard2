import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().min(1, 'VITE_SUPABASE_URL is required — see .env.example'),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_ANON_KEY is required — see .env.example'),
})

/**
 * Validated environment variables. Parsing happens once, at import time, so a
 * misconfigured environment fails fast with a clear message instead of
 * surfacing as a confusing error deep inside the Supabase client later.
 */
export const env = envSchema.parse(import.meta.env)
