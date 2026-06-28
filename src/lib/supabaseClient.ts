import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from './env'

export type { Session, User } from '@supabase/supabase-js'

/**
 * The only Supabase client instance in the app. Per docs/04-architecture.md
 * §Data-access layer, every other file that needs Supabase imports it from
 * here rather than constructing its own client.
 *
 * Typed against src/types/database.ts, hand-written to match
 * supabase/migrations/20260627234219_init_schema.sql — see that file's
 * header for how to replace it with a real generated one later.
 */
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
