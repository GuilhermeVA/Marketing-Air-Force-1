import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { readSupabaseEnv } from './env'

const { url, publishableKey } = readSupabaseEnv(import.meta.env)

/** Cliente único do Supabase para todo o app. */
export const supabase = createClient<Database>(url, publishableKey)
