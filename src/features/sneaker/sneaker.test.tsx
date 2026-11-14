import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { ScratchState } from '../scratch/api'
import { parseSneakerDetail } from './api'
import type { SneakerApi, SneakerDetail } from './api'
import { SneakerDetailView } from './SneakerDetailView'

// O Embla depende de APIs de layout que o jsdom não tem; a navegação do carrossel
// também atualiza o índice localmente, que é o que os testes verificam.
vi.mock('embla-carousel-react', () => ({ default: () => [() => {}, undefined] }))

const raw = (unlocked: boolean) => ({
  id: 'k-6',
  slug: 'dourado',
  name: 'Air Force 1 Dourado',
  color_name: 'Dourado',
  color_hex: '#c9a227',
  rarity: 'rara',
  unlocked,
  is_favorite: false,
  keywords: unlocked ? ['Riqueza', 'Prosperidade'] : null,
  meaning: unlocked ? 'O dourado é a conquista que se vê de longe.' : null,
  images: [3, 1, 2].map((n) => ({
    id: `i${n}`,
    url: `/d-${n}.svg`,
    alt: `Dourado ${n}`,
    position: n,
  })),
})

function renderView(
  detail: SneakerDetail | null,
  scratch: ScratchState = { status: 'all_unlocked' },
) {
  const api: SneakerApi = { getDetail: vi.fn(async () => detail) }
  const closet = { setFavorite: vi.fn(async () => {}) }
  render(
    <MemoryRouter>
      <SneakerDetailView
        slug="dourado"
        api={api}
        closet={closet}
        getScratch={async () => scratch}
      />
    </MemoryRouter>,
  )
  return { closet, user: userEvent.setup() }
}

describe('parseSneakerDetail', () => {
  it('ordena as imagens e mantém o significado nulo para bloqueados', () => {
    const locked = parseSneakerDetail(raw(false))!
    expect(locked.images.map((i) => i.position)).toEqual([1, 2, 3])
    expect(locked.meaning).toBeNull()
    expect(parseSneakerDetail(null)).toBeNull()
  })
})

describe('SneakerDetailView — desbloqueado (PBI-015)', () => {
  it('mostra nome, palavras-chave, significado e o carrossel', async () => {
    renderView(parseSneakerDetail(raw(true)))
    expect(await screen.findByRole('heading', { level: 1, name: 'Dourado' })).toBeInTheDocument()
    expect(screen.getByText('Riqueza')).toBeInTheDocument()
    expect(screen.getByText('O dourado é a conquista que se vê de longe.')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: 'Dourado 1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '‹ Closet' })).toHaveAttribute('href', '/closet')
  })

  it('navega pelo carrossel com setas, teclado e miniaturas', async () => {
    const { user } = renderView(parseSneakerDetail(raw(true)))
    const prev = await screen.findByRole('button', { name: 'Imagem anterior' })
    expect(prev).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Próxima imagem' }))
    expect(screen.getByText('Imagem 2 de 3')).toBeInTheDocument()
    screen.getByRole('region', { name: 'Imagens do Air Force 1 Dourado' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Imagem 3 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver imagem 1' }))
    expect(screen.getByRole('button', { name: 'Ver imagem 1' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('amplia a imagem e fecha com Esc', async () => {
    const { user } = renderView(parseSneakerDetail(raw(true)))
    await user.click(await screen.findByRole('button', { name: 'Ampliar: Dourado 1' }))
    expect(screen.getByRole('dialog', { name: 'Imagem ampliada: Dourado 1' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('favorita o par', async () => {
    const { user, closet } = renderView(parseSneakerDetail(raw(true)))
    await user.click(await screen.findByRole('button', { name: 'Favoritar' }))
    expect(closet.setFavorite).toHaveBeenCalledWith('k-6', true)
    expect(screen.getByRole('button', { name: 'Favorito' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('slug inexistente mostra "Par não encontrado"', async () => {
    renderView(null)
    expect(await screen.findByRole('heading', { name: 'Par não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao closet' })).toHaveAttribute(
      'href',
      '/closet',
    )
  })
})

describe('SneakerDetailView — bloqueado (PBI-016)', () => {
  it('mostra cadeado e aviso no lugar do significado', async () => {
    renderView(parseSneakerDetail(raw(false)))
    expect(
      await screen.findByText('Desbloqueie esse tênis para ver o que ele simboliza.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Dourado 1 (bloqueado)' })).toBeInTheDocument()
    expect(screen.queryByText('Riqueza')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Favoritar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('leva à raspadinha quando há uma disponível', async () => {
    const scratch = {
      status: 'available',
      scratch: { id: 's', status: 'livre', createdAt: '', revealedAt: null },
      sneaker: { id: 'k', slug: 'x', name: 'x', colorName: 'x', colorHex: '#000000', image: null },
    } as ScratchState
    renderView(parseSneakerDetail(raw(false)), scratch)
    expect(await screen.findByRole('link', { name: 'Ir para a raspadinha' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
