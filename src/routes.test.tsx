import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('rotas', () => {
  it.each([
    ['/', 'Raspadinha'],
    ['/cupom', 'Cupom'],
    ['/closet', 'Closet'],
    ['/tenis/dourado', 'Tênis: dourado'],
    ['/privacidade', 'Privacidade'],
    ['/rota-que-nao-existe', 'Página não encontrada'],
  ])('%s renderiza "%s"', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading)
  })
})
