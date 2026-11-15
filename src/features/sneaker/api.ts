import type { SupabaseClient } from '@supabase/supabase-js'
import type { Rarity, SneakerImage } from '../catalog/api'

export type SneakerDetail = {
  id: string
  slug: string
  name: string
  colorName: string
  colorHex: string
  rarity: Rarity
  unlocked: boolean
  isFavorite: boolean
  /** Só para pares desbloqueados; `null` quando bloqueado. */
  keywords: string[] | null
  meaning: string | null
  /** Foto de modelo usando o par; só para pares desbloqueados. */
  modelImageUrl: string | null
  images: SneakerImage[]
}

export function parseSneakerDetail(raw: unknown): SneakerDetail | null {
  if (!raw) return null
  const v = raw as Record<string, unknown>
  return {
    id: String(v.id),
    slug: String(v.slug),
    name: String(v.name),
    colorName: String(v.color_name),
    colorHex: String(v.color_hex),
    rarity: v.rarity as Rarity,
    unlocked: v.unlocked === true,
    isFavorite: v.is_favorite === true,
    keywords: (v.keywords as string[] | null) ?? null,
    meaning: (v.meaning as string | null) ?? null,
    modelImageUrl: (v.model_image_url as string | null) ?? null,
    images: ((v.images as SneakerImage[] | null) ?? [])
      .slice()
      .sort((a, b) => a.position - b.position),
  }
}

export function createSneakerApi(client: SupabaseClient) {
  return {
    /** Detalhe do par; o significado só vem se o usuário o desbloqueou. `null` se não existir. */
    async getDetail(slug: string): Promise<SneakerDetail | null> {
      const { data, error } = await client.rpc('af1_get_sneaker_detail', { p_slug: slug })
      if (error) throw new Error('Não foi possível carregar o tênis.', { cause: error })
      return parseSneakerDetail(data)
    },
  }
}

export type SneakerApi = ReturnType<typeof createSneakerApi>
