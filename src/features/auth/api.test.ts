import { describe, expect, it } from 'vitest'
import { fakeAuthClient, fakeSession, fakeUser } from '../../test/fakeAuthClient'
import {
  AuthFlowError,
  createAuthApi,
  safeReturnPath,
  toAuthFlowError,
  validateSignUp,
} from './api'

const validSignUp = {
  nickname: ' Rodrigo ',
  email: ' Rodrigo@Example.com ',
  password: 'senha-forte-1',
  consent: true,
}

describe('validateSignUp', () => {
  it('aceita dados válidos', () => {
    expect(validateSignUp(validSignUp)).toEqual({})
  })

  it('aponta cada campo inválido', () => {
    expect(validateSignUp({ nickname: ' ', email: 'x@', password: '123', consent: false })).toEqual(
      {
        nickname: expect.any(String),
        email: 'Digite um e-mail válido.',
        password: 'A senha precisa ter pelo menos 8 caracteres.',
        consent: 'É preciso aceitar o termo de privacidade.',
      },
    )
  })
})

describe('authApi.signUp', () => {
  it('converte a sessão anônima (mesmo id), renova o token e grava o perfil', async () => {
    const fake = fakeAuthClient({
      session: fakeSession(fakeUser({ id: 'anon-1', is_anonymous: true })),
    })
    fake.auth.updateUser.mockResolvedValue({
      data: { user: fakeUser({ id: 'anon-1' }) },
      error: null,
    })

    await createAuthApi(fake.client).signUp(validSignUp)

    expect(fake.auth.updateUser).toHaveBeenCalledWith({
      email: 'rodrigo@example.com',
      password: 'senha-forte-1',
    })
    expect(fake.auth.refreshSession).toHaveBeenCalled()
    expect(fake.from).toHaveBeenCalledWith('af1_profiles')
    expect(fake.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'anon-1',
        nickname: 'Rodrigo',
        consent_at: expect.any(String),
      }),
      { onConflict: 'id', ignoreDuplicates: true },
    )
  })

  it('não chama o Supabase sem consentimento', async () => {
    const fake = fakeAuthClient({ session: fakeSession() })
    await expect(
      createAuthApi(fake.client).signUp({ ...validSignUp, consent: false }),
    ).rejects.toMatchObject({ code: 'validation_failed' })
    expect(fake.auth.updateUser).not.toHaveBeenCalled()
  })

  it('traduz e-mail já cadastrado', async () => {
    const fake = fakeAuthClient({ session: fakeSession() })
    fake.auth.updateUser.mockResolvedValue({
      data: { user: null },
      error: {
        code: 'email_exists',
        message: 'A user with this email address has already been registered',
      },
    })
    await expect(createAuthApi(fake.client).signUp(validSignUp)).rejects.toThrow(
      'Este e-mail já tem cadastro. Entre com a sua senha.',
    )
    expect(fake.upsert).not.toHaveBeenCalled()
  })

  it('recusa novo cadastro de quem já tem conta', async () => {
    const fake = fakeAuthClient({ session: fakeSession(fakeUser({ is_anonymous: false })) })
    await expect(createAuthApi(fake.client).signUp(validSignUp)).rejects.toMatchObject({
      code: 'already_signed_in',
    })
  })
})

describe('authApi.signIn', () => {
  it('entra com e-mail normalizado e traduz credenciais inválidas', async () => {
    const fake = fakeAuthClient({ session: fakeSession() })
    fake.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    })
    await expect(
      createAuthApi(fake.client).signIn({ email: ' A@B.com ', password: 'x' }),
    ).rejects.toThrow('E-mail ou senha incorretos.')
    expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'x' })
  })
})

describe('toAuthFlowError', () => {
  it('reconhece falha de rede', () => {
    const e = toAuthFlowError({
      name: 'AuthRetryableFetchError',
      message: 'Failed to fetch',
      status: 0,
    })
    expect(e).toBeInstanceOf(AuthFlowError)
    expect(e.code).toBe('network')
  })

  it('usa mensagem genérica para erro desconhecido', () => {
    expect(toAuthFlowError({ code: 'algo_novo' }).message).toBe(
      'Algo deu errado. Tente de novo em instantes.',
    )
  })
})

describe('safeReturnPath', () => {
  it.each([
    ['/closet', '/closet'],
    ['/tenis/dourado?x=1', '/tenis/dourado?x=1'],
    [null, '/'],
    ['https://site-malicioso.com', '/'],
    ['//site-malicioso.com', '/'],
    ['/\\site-malicioso.com', '/'],
  ])('%s -> %s', (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected)
  })
})
