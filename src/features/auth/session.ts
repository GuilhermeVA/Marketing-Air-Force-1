import type { Session, SupabaseClient } from '@supabase/supabase-js'

const pending = new WeakMap<SupabaseClient, Promise<Session>>()

/**
 * Garante uma sessão: reutiliza a existente (persistida no navegador) ou cria
 * uma anônima. Chamadas simultâneas compartilham a mesma promessa, então o
 * StrictMode do React ou dois componentes não criam dois usuários anônimos.
 */
export function ensureSession(client: SupabaseClient): Promise<Session> {
  const inFlight = pending.get(client)
  if (inFlight) return inFlight

  const run = (async () => {
    const { data, error } = await client.auth.getSession()
    if (error) throw error
    if (data.session) return data.session

    const anon = await client.auth.signInAnonymously()
    if (anon.error) throw anon.error
    if (!anon.data.session) throw new Error('O Supabase não retornou uma sessão anônima.')
    return anon.data.session
  })()

  pending.set(client, run)
  run.finally(() => pending.delete(client)).catch(() => {})
  return run
}
