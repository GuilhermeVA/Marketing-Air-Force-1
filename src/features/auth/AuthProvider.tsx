import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './context'
import type { AuthState } from './context'
import { ensureSession } from './session'

type AuthProviderProps = {
  client: SupabaseClient
  children: ReactNode
}

/**
 * Mantém a sessão do Supabase Auth. Sem sessão, cria uma anônima: o visitante
 * raspa sem cadastro e, ao se cadastrar, a mesma sessão vira conta (PBI-005/006).
 */
export function AuthProvider({ client, children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    ensureSession(client)
      .then((s) => active && setSession(s))
      .catch((e: unknown) => active && setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => active && setLoading(false))

    const { data } = client.auth.onAuthStateChange((event, s) => {
      if (!active) return
      if (event === 'SIGNED_OUT' || !s) {
        // Depois de sair, o visitante volta a ter uma sessão anônima nova.
        setSession(null)
        ensureSession(client)
          .then((next) => active && setSession(next))
          .catch((e: unknown) => active && setError(e instanceof Error ? e : new Error(String(e))))
        return
      }
      setSession(s)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [client, attempt])

  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      isAnonymous: session?.user.is_anonymous ?? false,
      loading,
      error,
      retry,
      client,
    }),
    [session, loading, error, retry, client],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
