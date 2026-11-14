import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { vi } from 'vitest'

type Listener = (event: string, session: Session | null) => void

export function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-11-14T00:00:00Z',
    is_anonymous: true,
    ...overrides,
  } as User
}

export function fakeSession(user: User = fakeUser()): Session {
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  } as Session
}

/** Cliente Supabase falso, só com os métodos de Auth usados pelo app. */
export function fakeAuthClient(options: { session?: Session | null; anonError?: Error } = {}) {
  const listeners = new Set<Listener>()
  let current: Session | null = options.session ?? null

  const auth = {
    getSession: vi.fn(async () => ({ data: { session: current }, error: null })),
    signInAnonymously: vi.fn(async () => {
      if (options.anonError)
        return { data: { session: null, user: null }, error: options.anonError }
      current = fakeSession(fakeUser({ id: 'anon-1', is_anonymous: true }))
      return { data: { session: current, user: current.user }, error: null }
    }),
    onAuthStateChange: vi.fn((cb: Listener) => {
      listeners.add(cb)
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } }
    }),
    updateUser: vi.fn(),
    refreshSession: vi.fn(async () => ({
      data: { session: current, user: current?.user ?? null },
      error: null,
    })),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(async () => {
      current = null
      listeners.forEach((l) => l('SIGNED_OUT', null))
      return { error: null }
    }),
  }

  const insert = vi.fn(async () => ({ error: null }))
  const upsert = vi.fn(async () => ({ error: null }))
  const from = vi.fn(() => ({ insert, upsert }))
  const rpc = vi.fn(async () => ({ data: { status: 'all_unlocked' }, error: null }))

  return {
    client: { auth, from, rpc } as unknown as SupabaseClient,
    rpc,
    auth,
    from,
    insert,
    upsert,
    /** Simula um evento do Supabase Auth (ex.: login em outra aba). */
    emit(event: string, session: Session | null) {
      current = session
      listeners.forEach((l) => l(event, session))
    },
    setSession(session: Session | null) {
      current = session
    },
  }
}
