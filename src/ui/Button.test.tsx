import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza o texto e usa type="button" por padrão', () => {
    render(<Button>Raspar</Button>)
    const button = screen.getByRole('button', { name: 'Raspar' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button.className).toContain('min-h-11')
  })

  it('dispara onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Raspar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Raspar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não dispara onClick quando desabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Raspar
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Raspar' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('aplica a variante secundária', () => {
    render(<Button variant="secondary">Closet</Button>)
    expect(screen.getByRole('button', { name: 'Closet' }).className).toContain('border-line')
  })
})
