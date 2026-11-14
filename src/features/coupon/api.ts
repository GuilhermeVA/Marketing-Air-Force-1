import type { SupabaseClient } from '@supabase/supabase-js'

export type Coupon = {
  code: string
  discountPercent: number
  expiresAt: string
}

export function createCouponApi(client: SupabaseClient) {
  return {
    /** Cupom da conta atual, ou `null` se ainda não houve resgate (o RLS filtra pelo usuário). */
    async getMyCoupon(): Promise<Coupon | null> {
      const { data, error } = await client
        .from('af1_coupons')
        .select('code, discount_percent, expires_at')
        .maybeSingle()
      if (error) throw new Error('Não foi possível carregar o seu cupom.', { cause: error })
      if (!data) return null
      return { code: data.code, discountPercent: data.discount_percent, expiresAt: data.expires_at }
    },
  }
}

export type CouponApi = ReturnType<typeof createCouponApi>

export function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function isExpired(coupon: Coupon, now: Date = new Date()): boolean {
  return new Date(coupon.expiresAt).getTime() < now.getTime()
}

/** Copia texto para a área de transferência, com alternativa para navegadores sem Clipboard API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // segue para a alternativa
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}
