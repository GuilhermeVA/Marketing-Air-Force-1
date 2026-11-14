import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AuthFlowError } from './api'
import { AuthForm } from './AuthForm'
import type { AuthMode } from './AuthForm'

function setup(mode: AuthMode = 'cadastro') {
  const api = { signUp: vi.fn(async () => {}), signIn: vi.fn(async () => {}) }
  const onSuccess = vi.fn()
  const onModeChange = vi.fn()
  render(
    <MemoryRouter>
      <AuthForm mode={mode} api={api} onSuccess={onSuccess} onModeChange={onModeChange} />
    </MemoryRouter>,
  )
  return { api, onSuccess, onModeChange, user: userEvent.setup() }
}

describe('AuthForm (cadastro)', () => {
  it('mantém o envio bloqueado até aceitar o termo', async () => {
    const { user } = setup()
    const submit = screen.getByRole('button', { name: 'Criar conta e guardar' })
    expect(submit).toBeDisabled()
    await user.click(screen.getByRole('checkbox'))
    expect(submit).toBeEnabled()
  })

  it('tem link para o termo de privacidade', () => {
    setup()
    expect(screen.getByRole('link', { name: 'termo de privacidade' })).toHaveAttribute(
      'href',
      '/privacidade',
    )
  })

  it('valida o e-mail e a senha antes de enviar', async () => {
    const { user, api } = setup()
    await user.type(screen.getByLabelText('Como podemos te chamar'), 'Rodrigo')
    await user.type(screen.getByLabelText('E-mail'), 'rodrigo@')
    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Criar conta e guardar' }))

    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument()
    expect(screen.getByText('A senha precisa ter pelo menos 8 caracteres.')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
    expect(api.signUp).not.toHaveBeenCalled()
  })

  it('envia os dados e chama onSuccess', async () => {
    const { user, api, onSuccess } = setup()
    await user.type(screen.getByLabelText('Como podemos te chamar'), 'Rodrigo')
    await user.type(screen.getByLabelText('E-mail'), 'rodrigo@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-forte-1')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Criar conta e guardar' }))

    expect(api.signUp).toHaveBeenCalledWith({
      nickname: 'Rodrigo',
      email: 'rodrigo@example.com',
      password: 'senha-forte-1',
      consent: true,
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('mostra o erro do servidor sem sair da tela', async () => {
    const { user, api, onSuccess } = setup()
    api.signUp.mockRejectedValueOnce(
      new AuthFlowError('email_exists', 'Este e-mail já tem cadastro. Entre com a sua senha.'),
    )
    await user.type(screen.getByLabelText('Como podemos te chamar'), 'Rodrigo')
    await user.type(screen.getByLabelText('E-mail'), 'rodrigo@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-forte-1')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Criar conta e guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já tem cadastro.')
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('mostra e oculta a senha', async () => {
    const { user } = setup()
    const password = screen.getByLabelText('Senha')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('troca para o modo de login', async () => {
    const { user, onModeChange } = setup()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(onModeChange).toHaveBeenCalledWith('login')
  })
})

describe('AuthForm (login)', () => {
  it('não pede apelido nem consentimento e chama signIn', async () => {
    const { user, api } = setup('login')
    expect(screen.queryByLabelText('Como podemos te chamar')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('E-mail'), 'rodrigo@example.com')
    await user.type(screen.getByLabelText('Senha'), 'qualquer')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(api.signIn).toHaveBeenCalledWith({ email: 'rodrigo@example.com', password: 'qualquer' })
  })
})
