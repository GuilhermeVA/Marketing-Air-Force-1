export type SupabaseEnv = {
  url: string
  publishableKey: string
}

type RawEnv = Record<string, string | boolean | undefined>

/** Lê e valida as variáveis do Supabase. Lança erro claro se faltar alguma. */
export function readSupabaseEnv(env: RawEnv): SupabaseEnv {
  const url = env.VITE_SUPABASE_URL
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY
  const missing = [
    typeof url === 'string' && url.trim() ? null : 'VITE_SUPABASE_URL',
    typeof publishableKey === 'string' && publishableKey.trim()
      ? null
      : 'VITE_SUPABASE_PUBLISHABLE_KEY',
  ].filter((name): name is string => name !== null)

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente ausentes: ${missing.join(', ')}. ` +
        'Copie .env.example para .env.local e preencha (ou configure na Vercel).',
    )
  }
  return { url: (url as string).trim(), publishableKey: (publishableKey as string).trim() }
}
