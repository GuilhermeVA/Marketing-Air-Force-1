import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthState = {
  /** Usuário atual (anônimo ou com conta). `null` enquanto carrega ou se houve erro. */
  user: User | null
  session: Session | null
  isAnonymous: boolean
  /** true até a primeira sessão ficar pronta. */
  loading: boolean
  error: Error | null
  /** Tenta criar/recuperar a sessão de novo depois de um erro. */
  retry: () => void
  client: SupabaseClient
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  return ctx
}
