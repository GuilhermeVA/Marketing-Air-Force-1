import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { fakeAuthClient, fakeSession, fakeUser } from '../../test/fakeAuthClient'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './context'
import { RequireSession } from './RequireSession'

function Probe() {
  const { user, isAnonymous, loading } = useAuth()
  if (loading) return <p>carregando</p>
  return <p>{`id=${user?.id} anon=${isAnonymous}`}</p>
}

describe('AuthProvider', () => {
  it('cria uma sessão anônima quando não há sessão (uma única vez, mesmo em StrictMode)', async () => {
    const fake = fakeAuthClient()
    render(
      <StrictMode>
        <AuthProvider client={fake.client}>
          <Probe />
        </AuthProvider>
      </StrictMode>,
    )
    expect(await screen.findByText('id=anon-1 anon=true')).toBeInTheDocument()
    expect(fake.auth.signInAnonymously).toHaveBeenCalledTimes(1)
  })

  it('reutiliza a sessão existente sem criar outro usuário', async () => {
    const fake = fakeAuthClient({
      session: fakeSession(fakeUser({ id: 'conta-9', is_anonymous: false })),
    })
    render(
      <AuthProvider client={fake.client}>
        <Probe />
      </AuthProvider>,
    )
    expect(await screen.findByText('id=conta-9 anon=false')).toBeInTheDocument()
    expect(fake.auth.signInAnonymously).not.toHaveBeenCalled()
  })

  it('acompanha mudanças de sessão (onAuthStateChange)', async () => {
    const fake = fakeAuthClient()
    render(
      <AuthProvider client={fake.client}>
        <Probe />
      </AuthProvider>,
    )
    await screen.findByText('id=anon-1 anon=true')
    act(() =>
      fake.emit('USER_UPDATED', fakeSession(fakeUser({ id: 'anon-1', is_anonymous: false }))),
    )
    expect(await screen.findByText('id=anon-1 anon=false')).toBeInTheDocument()
  })

  it('cria nova sessão anônima depois de sair', async () => {
    const fake = fakeAuthClient({
      session: fakeSession(fakeUser({ id: 'conta-9', is_anonymous: false })),
    })
    render(
      <AuthProvider client={fake.client}>
        <Probe />
      </AuthProvider>,
    )
    await screen.findByText('id=conta-9 anon=false')
    await act(() => fake.auth.signOut())
    expect(await screen.findByText('id=anon-1 anon=true')).toBeInTheDocument()
  })
})

describe('RequireSession', () => {
  function renderGate(fake: ReturnType<typeof fakeAuthClient>) {
    const router = createMemoryRouter(
      [{ element: <RequireSession />, children: [{ path: '/', element: <p>conteúdo</p> }] }],
      { initialEntries: ['/'] },
    )
    render(
      <AuthProvider client={fake.client}>
        <RouterProvider router={router} />
      </AuthProvider>,
    )
  }

  it('mostra carregamento e depois o conteúdo', async () => {
    const fake = fakeAuthClient()
    renderGate(fake)
    expect(screen.getByRole('status')).toHaveTextContent('Preparando sua experiência')
    expect(await screen.findByText('conteúdo')).toBeInTheDocument()
  })

  it('mostra erro amigável e tenta de novo', async () => {
    const fake = fakeAuthClient({ anonError: new Error('rede') })
    renderGate(fake)
    expect(await screen.findByText('Não conseguimos abrir a experiência')).toBeInTheDocument()

    fake.auth.signInAnonymously.mockImplementationOnce(async () => {
      const s = fakeSession(fakeUser({ id: 'anon-2' }))
      fake.setSession(s)
      return { data: { session: s, user: s.user }, error: null }
    })
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    await waitFor(() => expect(screen.getByText('conteúdo')).toBeInTheDocument())
  })
})
