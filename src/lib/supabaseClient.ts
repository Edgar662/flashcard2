import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export type { Session, User } from '@supabase/supabase-js'

/**
 * The only Supabase client instance in the app. Per docs/04-architecture.md
 * §Data-access layer, every other file that needs Supabase imports it from
 * here rather than constructing its own client.
 *
 * Untyped for now — once supabase/migrations exist, regenerate
 * `Database` via `supabase gen types typescript` and pass it as
 * `createClient<Database>(...)` (see docs/09-api-design.md).
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)
