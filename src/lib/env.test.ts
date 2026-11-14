import { describe, expect, it } from 'vitest'
import { readSupabaseEnv } from './env'

describe('readSupabaseEnv', () => {
  it('retorna as variáveis quando estão presentes', () => {
    expect(
      readSupabaseEnv({
        VITE_SUPABASE_URL: ' https://x.supabase.co ',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abc',
      }),
    ).toEqual({ url: 'https://x.supabase.co', publishableKey: 'sb_publishable_abc' })
  })

  it('lança erro listando as variáveis ausentes', () => {
    expect(() => readSupabaseEnv({})).toThrow(/VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY/)
  })

  it('trata string vazia como ausente', () => {
    expect(() =>
      readSupabaseEnv({
        VITE_SUPABASE_URL: 'https://x.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: '  ',
      }),
    ).toThrow(/VITE_SUPABASE_PUBLISHABLE_KEY/)
  })
})
