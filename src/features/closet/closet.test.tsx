import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Sneaker } from '../catalog/api'
import type { ScratchState } from '../scratch/api'
import type { ClosetApi } from './api'
import { ClosetView } from './ClosetView'
import { buildCloset, loadSortMode, sortCloset } from './model'
import type { Unlock } from './model'

const colors = ['Azul-marinho', 'Verde-musgo', 'Vinho', 'Laranja', 'Vermelho', 'Dourado']
const sneakers: Sneaker[] = colors.map((c, i) => ({
  id: `k-${i}`,
  slug: c.toLowerCase(),
  name: `Air Force 1 ${c}`,
  colorName: c,
  colorHex: '#123456',
  keywords: [],
  meaning: '',
  rarity: 'comum',
  sortOrder: i,
  images: [{ id: `i-${i}`, url: `/${i}.svg`, alt: c, position: 1 }],
}))
const unlocks: Unlock[] = [
  { sneakerId: 'k-1', unlockedAt: '2026-11-13T10:00:00Z', isFavorite: false },
  { sneakerId: 'k-5', unlockedAt: '2026-11-14T10:00:00Z', isFavorite: true },
]

describe('buildCloset', () => {
  it('mantém a ordem do catálogo e marca os desbloqueados', () => {
    const items = buildCloset(sneakers, unlocks)
    expect(items.map((i) => i.unlocked)).toEqual([false, true, false, false, false, true])
    expect(items[5]).toMatchObject({ isFavorite: true, unlockedAt: '2026-11-14T10:00:00Z' })
  })
})

function renderCloset(
  opts: { unlocks?: Unlock[]; isAnonymous?: boolean; scratch?: ScratchState } = {},
) {
  const closet = {
    listUnlocks: vi.fn(async () => opts.unlocks ?? unlocks),
    setFavorite: vi.fn(async () => {}),
  }
  render(
    <MemoryRouter>
      <ClosetView
        catalog={{ listSneakers: async () => sneakers }}
        closet={closet as unknown as ClosetApi}
        getScratch={async () => opts.scratch ?? { status: 'all_unlocked' }}
        isAnonymous={opts.isAnonymous ?? false}
        account={<p>conta</p>}
      />
    </MemoryRouter>,
  )
  return closet
}

describe('ClosetView', () => {
  it('mostra todos os pares, com progresso, e indica os bloqueados por ícone e texto', async () => {
    renderCloset()
    expect(await screen.findByText('2 de 6 pares')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('link')).toHaveLength(6)
    expect(within(list).getAllByText('Bloqueado')).toHaveLength(4)
    expect(within(list).getAllByText('Desbloqueado')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Vinho, bloqueado' })).toHaveAttribute(
      'href',
      '/tenis/vinho',
    )
    expect(screen.getByRole('link', { name: 'Dourado' })).toHaveAttribute('href', '/tenis/dourado')
  })

  it('sem pares desbloqueados convida a raspar e se cadastrar', async () => {
    renderCloset({ unlocks: [], isAnonymous: true })
    expect(
      await screen.findByText(/crie sua conta para guardar o primeiro par/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Meu cupom' })).not.toBeInTheDocument()
  })

  it('atalho da raspadinha mostra a disponibilidade e há atalho para o cupom', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    renderCloset({
      scratch: {
        status: 'unavailable',
        reason: 'daily_limit',
        nextAvailableAt: tomorrow.toISOString(),
      },
    })
    expect(
      await screen.findByRole('link', { name: 'Próxima raspadinha amanhã às 00:00' }),
    ).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Meu cupom' })).toHaveAttribute('href', '/cupom')
  })
})

describe('sortCloset (PBI-014)', () => {
  const items = buildCloset(sneakers, unlocks)
  const slugs = (mode: Parameters<typeof sortCloset>[1]) =>
    sortCloset(items, mode).map((i) => i.sneaker.slug)

  it('ordena pelas 4 opções', () => {
    expect(slugs('catalogo')).toEqual([
      'azul-marinho',
      'verde-musgo',
      'vinho',
      'laranja',
      'vermelho',
      'dourado',
    ])
    expect(slugs('favoritos').slice(0, 2)).toEqual(['dourado', 'verde-musgo'])
    expect(slugs('desbloqueados').slice(0, 2)).toEqual(['verde-musgo', 'dourado'])
    expect(slugs('recentes').slice(0, 2)).toEqual(['dourado', 'verde-musgo'])
  })

  it('não altera a lista original', () => {
    sortCloset(items, 'recentes')
    expect(items[0].sneaker.slug).toBe('azul-marinho')
  })
})

describe('ClosetView — favoritos e ordenação (PBI-014)', () => {
  it('favorita na hora e salva no servidor', async () => {
    const closet = renderCloset()
    const user = userEvent.setup()
    const button = await screen.findByRole('button', { name: 'Favorito: Verde-musgo' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(closet.setFavorite).toHaveBeenCalledWith('k-1', true)
  })

  it('desfaz o favorito se o servidor recusar', async () => {
    const closet = renderCloset()
    closet.setFavorite.mockRejectedValueOnce(new Error('rede'))
    const user = userEvent.setup()
    const button = await screen.findByRole('button', { name: 'Favorito: Dourado' })
    await user.click(button)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar o favorito')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('pares bloqueados não têm botão de favorito', async () => {
    renderCloset()
    await screen.findByText('2 de 6 pares')
    expect(screen.queryByRole('button', { name: 'Favorito: Vinho' })).not.toBeInTheDocument()
  })

  it('lembra a ordenação escolhida', async () => {
    localStorage.clear()
    renderCloset()
    const user = userEvent.setup()
    await user.selectOptions(await screen.findByLabelText('Ordenar'), 'recentes')
    expect(loadSortMode()).toBe('recentes')
    const names = within(screen.getByRole('list'))
      .getAllByRole('link')
      .map((a) => a.getAttribute('aria-label'))
    expect(names.slice(0, 2)).toEqual(['Dourado', 'Verde-musgo'])
  })
})
