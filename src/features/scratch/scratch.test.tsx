import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { formatNextAvailable, parseScratchState } from './api'
import type { ScratchApi, ScratchState } from './api'
import { ScratchCard } from './ScratchCard'
import { computeClearedRatio } from './scratchMath'
import { ScratchHome } from './ScratchHome'

const rawAvailable = (status: 'livre' | 'revelada') => ({
  status: 'available',
  scratch: { id: 's-1', status, created_at: '2026-11-14T12:00:00Z', revealed_at: null },
  sneaker: {
    id: 'k-1',
    slug: 'dourado',
    name: 'Air Force 1 Dourado',
    color_name: 'Dourado',
    color_hex: '#c9a227',
    image: { url: '/placeholders/dourado-1.svg', alt: 'Air Force 1 Dourado, vista lateral' },
  },
})

describe('parseScratchState', () => {
  it('converte a resposta disponível', () => {
    const s = parseScratchState(rawAvailable('livre'))
    expect(s).toMatchObject({
      status: 'available',
      scratch: { id: 's-1', status: 'livre' },
      sneaker: { colorHex: '#c9a227' },
    })
  })

  it('converte indisponível e coleção completa', () => {
    expect(
      parseScratchState({
        status: 'unavailable',
        reason: 'daily_limit',
        next_available_at: '2026-11-15T03:00:00Z',
      }),
    ).toEqual({
      status: 'unavailable',
      reason: 'daily_limit',
      nextAvailableAt: '2026-11-15T03:00:00Z',
    })
    expect(parseScratchState({ status: 'all_unlocked' })).toEqual({ status: 'all_unlocked' })
  })

  it('rejeita resposta inesperada', () => {
    expect(() => parseScratchState({ status: 'outra' })).toThrow()
  })
})

describe('formatNextAvailable', () => {
  const now = new Date(2026, 10, 14, 15, 0)
  it.each([
    [new Date(2026, 10, 14, 23, 30), 'hoje às 23:30'],
    [new Date(2026, 10, 15, 0, 0), 'amanhã às 00:00'],
    [new Date(2026, 10, 17, 0, 0), 'em 17/11 às 00:00'],
  ])('%s', (date, expected) => {
    expect(formatNextAvailable(date.toISOString(), now)).toBe(expected)
  })
})

describe('computeClearedRatio', () => {
  it('mede a fração de pixels com alfa zero', () => {
    const width = 10
    const data = new Uint8ClampedArray(width * 10 * 4).fill(255)
    for (let i = 0; i < 50; i++) data[i * 4 + 3] = 0 // metade de cima apagada
    expect(computeClearedRatio(data, width, 1)).toBe(0.5)
    expect(computeClearedRatio(new Uint8ClampedArray(0), 1)).toBe(0)
  })
})

describe('ScratchCard', () => {
  it('"Revelar" dispara onReveal uma única vez e some', async () => {
    const onReveal = vi.fn()
    render(
      <ScratchCard
        image={{ url: '/x.svg', alt: 'Par' }}
        colorHex="#c9a227"
        revealed={false}
        onReveal={onReveal}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Revelar' }))
    expect(onReveal).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Revelar' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Par' })).toBeInTheDocument()
  })

  it('não expõe o texto alternativo do prêmio antes de revelar', () => {
    render(
      <ScratchCard
        image={{ url: '/x.svg', alt: 'Par' }}
        colorHex="#c9a227"
        revealed={false}
        onReveal={() => {}}
      />,
    )
    expect(screen.queryByRole('img', { name: 'Par' })).not.toBeInTheDocument()
  })
})

const redeemed = (coupon: boolean) => ({
  sneaker: { id: 'k-1', slug: 'dourado', name: 'Air Force 1 Dourado', colorName: 'Dourado' },
  coupon: coupon
    ? { code: 'AF1-ABCD', discountPercent: 10, expiresAt: '2026-11-24T12:00:00Z' }
    : null,
})

function fakeApi(state: ScratchState | Error) {
  return {
    getOrCreate: vi.fn(async () => {
      if (state instanceof Error) throw state
      return state
    }),
    markRevealed: vi.fn(async () => {}),
    redeem: vi.fn(async () => redeemed(true)),
  } satisfies ScratchApi
}

function renderHome(api: ScratchApi, isAnonymous = true) {
  render(
    <MemoryRouter>
      <ScratchHome api={api} isAnonymous={isAnonymous} userKey="u" />
    </MemoryRouter>,
  )
}

describe('ScratchHome', () => {
  it('mostra a raspadinha e registra a revelação', async () => {
    const api = fakeApi(parseScratchState(rawAvailable('livre')))
    renderHome(api)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Revelar' }))
    expect(api.markRevealed).toHaveBeenCalledWith('s-1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Seu par: Dourado')
    expect(screen.getByRole('link', { name: 'Guardar no meu closet' })).toHaveAttribute(
      'href',
      '/entrar?modo=cadastro&voltar=/',
    )
  })

  it('reabertura com prêmio revelado mostra o mesmo par sem raspar de novo', async () => {
    renderHome(fakeApi(parseScratchState(rawAvailable('revelada'))))
    expect(await screen.findByRole('heading', { name: 'Seu par: Dourado' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revelar' })).not.toBeInTheDocument()
  })

  it('limite diário mostra quando a próxima libera', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    renderHome(
      fakeApi({
        status: 'unavailable',
        reason: 'daily_limit',
        nextAvailableAt: tomorrow.toISOString(),
      }),
      false,
    )
    expect(
      await screen.findByText('Sua próxima raspadinha libera amanhã às 00:00.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver meu closet' })).toHaveAttribute('href', '/closet')
  })

  it('anônimo que já usou é convidado a criar conta', async () => {
    renderHome(fakeApi({ status: 'unavailable', reason: 'signup_required', nextAvailableAt: null }))
    expect(await screen.findByRole('link', { name: 'Criar conta' })).toBeInTheDocument()
  })

  it('coleção completa leva ao closet', async () => {
    renderHome(fakeApi({ status: 'all_unlocked' }), false)
    expect(await screen.findByRole('heading', { name: 'Coleção completa' })).toBeInTheDocument()
  })

  it('erro de rede permite tentar de novo', async () => {
    const api = fakeApi(new Error('rede'))
    renderHome(api)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }))
    expect(api.getOrCreate).toHaveBeenCalledTimes(2)
  })
})

describe('ScratchHome — resgate (PBI-011)', () => {
  it('conta logada: ao revelar, resgata sozinha e oferece o cupom', async () => {
    const api = fakeApi(parseScratchState(rawAvailable('livre')))
    renderHome(api, false)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Revelar' }))
    expect(await screen.findByRole('link', { name: 'Ver meu cupom' })).toHaveAttribute(
      'href',
      '/cupom',
    )
    expect(api.redeem).toHaveBeenCalledTimes(1)
    expect(api.redeem).toHaveBeenCalledWith('s-1')
    expect(screen.getByText(/Guardado no seu closet/)).toBeInTheDocument()
  })

  it('volta do cadastro com prêmio revelado: resgata sem pedir nada', async () => {
    const api = fakeApi(parseScratchState(rawAvailable('revelada')))
    api.redeem.mockResolvedValueOnce(redeemed(false))
    renderHome(api, false)
    expect(await screen.findByRole('link', { name: 'Ver meu closet' })).toHaveAttribute(
      'href',
      '/closet',
    )
    expect(api.redeem).toHaveBeenCalledTimes(1)
  })

  it('anônimo não resgata: vê o convite para guardar no closet', async () => {
    const api = fakeApi(parseScratchState(rawAvailable('revelada')))
    renderHome(api, true)
    expect(await screen.findByRole('link', { name: 'Guardar no meu closet' })).toBeInTheDocument()
    expect(api.redeem).not.toHaveBeenCalled()
  })

  it('falha no resgate mantém o prêmio e permite tentar de novo', async () => {
    const api = fakeApi(parseScratchState(rawAvailable('revelada')))
    api.redeem.mockRejectedValueOnce(new Error('rede'))
    renderHome(api, false)
    expect(await screen.findByRole('alert')).toHaveTextContent('O prêmio continua reservado')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByRole('link', { name: 'Ver meu cupom' })).toBeInTheDocument()
    expect(api.redeem).toHaveBeenCalledTimes(2)
  })
})
