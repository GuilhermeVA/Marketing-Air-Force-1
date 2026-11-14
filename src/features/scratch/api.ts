import type { SupabaseClient } from '@supabase/supabase-js'

export type ScratchSneaker = {
  id: string
  slug: string
  name: string
  colorName: string
  colorHex: string
  image: { url: string; alt: string } | null
}

export type ScratchState =
  | {
      status: 'available'
      scratch: {
        id: string
        status: 'livre' | 'revelada' | 'resgatada'
        createdAt: string
        revealedAt: string | null
      }
      sneaker: ScratchSneaker
    }
  | {
      status: 'unavailable'
      reason: 'signup_required' | 'daily_limit'
      nextAvailableAt: string | null
    }
  | { status: 'all_unlocked' }

export type RedeemResult = {
  sneaker: { id: string; slug: string; name: string; colorName: string }
  /** Cupom emitido neste resgate (só no primeiro resgate da conta). */
  coupon: { code: string; discountPercent: number; expiresAt: string } | null
}

export class ScratchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ScratchError'
  }
}

type Json = Record<string, unknown>

/** Converte a resposta da RPC (jsonb em snake_case) no tipo do app. */
export function parseScratchState(raw: unknown): ScratchState {
  const v = (raw ?? {}) as Json
  if (v.status === 'available') {
    const s = v.scratch as Json
    const k = v.sneaker as Json
    return {
      status: 'available',
      scratch: {
        id: String(s.id),
        status: s.status as 'livre' | 'revelada' | 'resgatada',
        createdAt: String(s.created_at),
        revealedAt: (s.revealed_at as string | null) ?? null,
      },
      sneaker: {
        id: String(k.id),
        slug: String(k.slug),
        name: String(k.name),
        colorName: String(k.color_name),
        colorHex: String(k.color_hex),
        image: (k.image as { url: string; alt: string } | null) ?? null,
      },
    }
  }
  if (v.status === 'unavailable') {
    return {
      status: 'unavailable',
      reason: v.reason === 'daily_limit' ? 'daily_limit' : 'signup_required',
      nextAvailableAt: (v.next_available_at as string | null) ?? null,
    }
  }
  if (v.status === 'all_unlocked') return { status: 'all_unlocked' }
  throw new ScratchError('Resposta inesperada do servidor.')
}

export function createScratchApi(client: SupabaseClient) {
  return {
    /** Raspadinha pendente ou nova (sorteada no servidor), ou o motivo de não haver. */
    async getOrCreate(): Promise<ScratchState> {
      const { data, error } = await client.rpc('af1_get_or_create_scratch')
      if (error)
        throw new ScratchError('Não foi possível carregar a sua raspadinha.', { cause: error })
      return parseScratchState(data)
    },

    async markRevealed(scratchId: string): Promise<void> {
      const { error } = await client.rpc('af1_mark_scratch_revealed', { p_scratch_id: scratchId })
      if (error) throw new ScratchError('Não foi possível registrar a revelação.', { cause: error })
    },

    /** Resgata o prêmio na conta (desbloqueia o par e, no primeiro resgate, emite o cupom). */
    async redeem(scratchId: string): Promise<RedeemResult> {
      const { data, error } = await client.rpc('af1_redeem_scratch', { p_scratch_id: scratchId })
      if (error)
        throw new ScratchError('Não foi possível guardar o par no seu closet.', { cause: error })
      return parseRedeemResult(data)
    },
  }
}

export function parseRedeemResult(raw: unknown): RedeemResult {
  const v = (raw ?? {}) as Record<string, Record<string, unknown> | null>
  const s = v.sneaker ?? {}
  const c = v.coupon
  return {
    sneaker: {
      id: String(s.id),
      slug: String(s.slug),
      name: String(s.name),
      colorName: String(s.color_name),
    },
    coupon: c
      ? {
          code: String(c.code),
          discountPercent: Number(c.discount_percent),
          expiresAt: String(c.expires_at),
        }
      : null,
  }
}

export type ScratchApi = ReturnType<typeof createScratchApi>

/** "hoje às 00:00", "amanhã às 00:00" ou "em 16/11 às 00:00", no fuso do aparelho. */
export function formatNextAvailable(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((day(date) - day(now)) / 86_400_000)
  if (diffDays <= 0) return `hoje às ${time}`
  if (diffDays === 1) return `amanhã às ${time}`
  return `em ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${time}`
}
