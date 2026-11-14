import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { isExpired } from './api'
import type { Coupon, CouponApi } from './api'
import { CouponView } from './CouponView'

const coupon: Coupon = { code: 'AF1-K7QX', discountPercent: 10, expiresAt: '2099-01-10T12:00:00Z' }

function renderView(result: Coupon | null | Error) {
  const api: CouponApi = {
    getMyCoupon: vi.fn(async () => {
      if (result instanceof Error) throw result
      return result
    }),
  }
  render(
    <MemoryRouter>
      <CouponView api={api} />
    </MemoryRouter>,
  )
  return api
}

describe('CouponView', () => {
  it('mostra código, desconto, validade e aviso de campanha simulada', async () => {
    renderView(coupon)
    expect(await screen.findByText('AF1-K7QX')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('Válido até 10/01/2099')).toBeInTheDocument()
    expect(screen.getByText(/cupom é fictício/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver meu closet' })).toHaveAttribute('href', '/closet')
  })

  it('"Copiar código" copia e confirma', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    renderView(coupon)
    await user.click(await screen.findByRole('button', { name: 'Copiar código' }))
    expect(writeText).toHaveBeenCalledWith('AF1-K7QX')
    expect(screen.getByRole('status')).toHaveTextContent('Código copiado')
  })

  it('sem cupom: leva para a raspadinha', async () => {
    renderView(null)
    expect(
      await screen.findByRole('heading', { name: 'Você ainda não tem cupom' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir para a raspadinha' })).toHaveAttribute('href', '/')
  })

  it('erro de rede permite tentar de novo', async () => {
    const api = renderView(new Error('rede'))
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }))
    expect(api.getMyCoupon).toHaveBeenCalledTimes(2)
  })

  it('identifica cupom expirado', () => {
    expect(isExpired({ ...coupon, expiresAt: '2020-01-01T00:00:00Z' })).toBe(true)
    expect(isExpired(coupon)).toBe(false)
  })
})
