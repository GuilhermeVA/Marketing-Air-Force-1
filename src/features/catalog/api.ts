import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../lib/database.types'

export type Rarity = 'comum' | 'intermediaria' | 'rara'

export type SneakerImage = {
  id: string
  url: string
  alt: string
  position: number
}

export type Sneaker = {
  id: string
  slug: string
  name: string
  colorName: string
  colorHex: string
  keywords: string[]
  meaning: string
  rarity: Rarity
  sortOrder: number
  images: SneakerImage[]
}

type Client = SupabaseClient<Database>
type SneakerRow = Database['public']['Tables']['af1_sneakers']['Row']
type ImageRow = Database['public']['Tables']['af1_sneaker_images']['Row']

const SELECT = `
  id, slug, name, color_name, color_hex, keywords, meaning, rarity, sort_order,
  images:af1_sneaker_images ( id, url, alt, position )
`

type Row = Pick<
  SneakerRow,
  | 'id'
  | 'slug'
  | 'name'
  | 'color_name'
  | 'color_hex'
  | 'keywords'
  | 'meaning'
  | 'rarity'
  | 'sort_order'
> & { images: Pick<ImageRow, 'id' | 'url' | 'alt' | 'position'>[] | null }

export function toSneaker(row: Row): Sneaker {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    colorName: row.color_name,
    colorHex: row.color_hex,
    keywords: row.keywords ?? [],
    meaning: row.meaning,
    rarity: row.rarity as Rarity,
    sortOrder: row.sort_order,
    images: [...(row.images ?? [])].sort((a, b) => a.position - b.position),
  }
}

export class CatalogError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'CatalogError'
  }
}

/** Acesso ao catálogo de tênis (somente leitura; o RLS já filtra pares inativos). */
export function createCatalogApi(client: Client) {
  return {
    /** Todos os pares ativos, na ordem do catálogo, com as imagens ordenadas. */
    async listSneakers(): Promise<Sneaker[]> {
      const { data, error } = await client
        .from('af1_sneakers')
        .select(SELECT)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
      if (error) throw new CatalogError('Não foi possível carregar o catálogo.', { cause: error })
      return (data as unknown as Row[]).map(toSneaker)
    },

    /** Um par pelo slug, ou `null` se não existir (ou estiver inativo). */
    async getSneakerBySlug(slug: string): Promise<Sneaker | null> {
      const { data, error } = await client
        .from('af1_sneakers')
        .select(SELECT)
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw new CatalogError('Não foi possível carregar o tênis.', { cause: error })
      return data ? toSneaker(data as unknown as Row) : null
    },
  }
}

export type CatalogApi = ReturnType<typeof createCatalogApi>
