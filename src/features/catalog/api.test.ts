import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import type { Database } from '../../lib/database.types'
import { CatalogError, createCatalogApi } from './api'

const row = (slug: string, sort: number, positions: number[] = [2, 1, 3]) => ({
  id: `id-${slug}`,
  slug,
  name: `Air Force 1 ${slug}`,
  color_name: slug,
  color_hex: '#c9a227',
  keywords: ['Riqueza', 'Prosperidade'],
  meaning: 'Texto',
  rarity: 'rara',
  sort_order: sort,
  images: positions.map((p) => ({
    id: `img-${slug}-${p}`,
    url: `/${slug}-${p}.svg`,
    alt: 'Alt',
    position: p,
  })),
})

/** Cliente falso que imita a cadeia from().select().order()/eq().maybeSingle(). */
function fakeClient(result: { data: unknown; error: unknown }) {
  const calls: Array<[string, ...unknown[]]> = []
  const builder = {
    select: (...a: unknown[]) => (calls.push(['select', ...a]), builder),
    order: (...a: unknown[]) => (calls.push(['order', ...a]), builder),
    eq: (...a: unknown[]) => (calls.push(['eq', ...a]), builder),
    maybeSingle: () => (calls.push(['maybeSingle']), Promise.resolve(result)),
    then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  }
  const client = { from: vi.fn((table: string) => (calls.push(['from', table]), builder)) }
  return { client: client as unknown as SupabaseClient<Database>, calls }
}

describe('catalogApi.listSneakers', () => {
  it('consulta af1_sneakers ordenando por sort_order e mapeia os campos', async () => {
    const { client, calls } = fakeClient({
      data: [row('azul', 10), row('dourado', 60)],
      error: null,
    })
    const list = await createCatalogApi(client).listSneakers()

    expect(calls[0]).toEqual(['from', 'af1_sneakers'])
    expect(calls).toContainEqual(['order', 'sort_order', { ascending: true }])
    expect(list.map((s) => s.slug)).toEqual(['azul', 'dourado'])
    expect(list[1]).toMatchObject({
      colorHex: '#c9a227',
      colorName: 'dourado',
      rarity: 'rara',
      sortOrder: 60,
    })
  })

  it('devolve as imagens ordenadas por position', async () => {
    const { client } = fakeClient({ data: [row('azul', 10, [3, 1, 2])], error: null })
    const [sneaker] = await createCatalogApi(client).listSneakers()
    expect(sneaker.images.map((i) => i.position)).toEqual([1, 2, 3])
  })

  it('lança CatalogError quando o Supabase retorna erro', async () => {
    const { client } = fakeClient({ data: null, error: { message: 'falhou' } })
    await expect(createCatalogApi(client).listSneakers()).rejects.toBeInstanceOf(CatalogError)
  })
})

describe('catalogApi.getSneakerBySlug', () => {
  it('filtra pelo slug e retorna o par', async () => {
    const { client, calls } = fakeClient({ data: row('dourado', 60), error: null })
    const sneaker = await createCatalogApi(client).getSneakerBySlug('dourado')
    expect(calls).toContainEqual(['eq', 'slug', 'dourado'])
    expect(sneaker?.name).toBe('Air Force 1 dourado')
  })

  it('retorna null para slug inexistente', async () => {
    const { client } = fakeClient({ data: null, error: null })
    expect(await createCatalogApi(client).getSneakerBySlug('nao-existe')).toBeNull()
  })
})
