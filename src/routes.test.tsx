import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './features/auth'
import { routes } from './routes'
import { fakeAuthClient } from './test/fakeAuthClient'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <AuthProvider client={fakeAuthClient().client}>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('rotas', () => {
  it.each([
    ['/', 'Coleção completa'],
    ['/cupom', 'Você ainda não tem cupom'],
    ['/closet', 'Closet'],
    ['/tenis/dourado', 'Tênis: dourado'],
    ['/privacidade', 'Privacidade'],
    ['/rota-que-nao-existe', 'Página não encontrada'],
  ])('%s renderiza "%s"', async (path, heading) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })
})
