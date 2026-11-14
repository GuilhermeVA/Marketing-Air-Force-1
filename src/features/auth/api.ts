import type { SupabaseClient } from '@supabase/supabase-js'

export const MIN_PASSWORD_LENGTH = 8
export const MAX_NICKNAME_LENGTH = 40

export type SignUpInput = {
  nickname: string
  email: string
  password: string
  consent: boolean
}

export type SignInInput = {
  email: string
  password: string
}

/** Erro com mensagem pronta para mostrar ao cliente. */
export class AuthFlowError extends Error {
  readonly code: string
  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'AuthFlowError'
    this.code = code
  }
}

const MESSAGES: Record<string, string> = {
  email_exists: 'Este e-mail já tem cadastro. Entre com a sua senha.',
  user_already_exists: 'Este e-mail já tem cadastro. Entre com a sua senha.',
  invalid_credentials: 'E-mail ou senha incorretos.',
  weak_password: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  email_address_invalid: 'Confira o e-mail digitado.',
  validation_failed: 'Confira os dados digitados.',
  over_request_rate_limit: 'Muitas tentativas seguidas. Aguarde um pouco e tente de novo.',
  signup_disabled: 'O cadastro está temporariamente indisponível.',
  network: 'Sem conexão com o servidor. Verifique a internet e tente de novo.',
  unknown: 'Algo deu errado. Tente de novo em instantes.',
}

/** Converte erros do Supabase em mensagens claras em português. */
export function toAuthFlowError(error: unknown): AuthFlowError {
  if (error instanceof AuthFlowError) return error
  const e = error as { code?: string; name?: string; status?: number; message?: string } | null
  let code = e?.code ?? 'unknown'
  if (e?.name === 'AuthRetryableFetchError' || e?.status === 0 || /fetch/i.test(e?.message ?? '')) {
    code = 'network'
  }
  return new AuthFlowError(code, MESSAGES[code] ?? MESSAGES.unknown, { cause: error })
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

/** Valida os campos do cadastro. Retorna as mensagens de erro por campo. */
export function validateSignUp(input: SignUpInput): Partial<Record<keyof SignUpInput, string>> {
  const errors: Partial<Record<keyof SignUpInput, string>> = {}
  const nickname = input.nickname.trim()
  if (!nickname) errors.nickname = 'Como podemos te chamar?'
  else if (nickname.length > MAX_NICKNAME_LENGTH)
    errors.nickname = `Use até ${MAX_NICKNAME_LENGTH} caracteres.`
  if (!isValidEmail(input.email)) errors.email = 'Digite um e-mail válido.'
  if (input.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  if (!input.consent) errors.consent = 'É preciso aceitar o termo de privacidade.'
  return errors
}

export function validateSignIn(input: SignInInput): Partial<Record<keyof SignInInput, string>> {
  const errors: Partial<Record<keyof SignInInput, string>> = {}
  if (!isValidEmail(input.email)) errors.email = 'Digite um e-mail válido.'
  if (!input.password) errors.password = 'Digite a sua senha.'
  return errors
}

export function createAuthApi(client: SupabaseClient) {
  return {
    /**
     * Cria a conta. Se o visitante está numa sessão anônima, ela vira a conta
     * (mesmo id), o que leva junto o prêmio reservado. Depois grava o perfil
     * com a data do consentimento.
     */
    async signUp(input: SignUpInput): Promise<void> {
      const invalid = validateSignUp(input)
      const first = Object.values(invalid)[0]
      if (first) throw new AuthFlowError('validation_failed', first)

      const email = input.email.trim().toLowerCase()
      const { data: current } = await client.auth.getSession()
      const user = current.session?.user

      if (user && !user.is_anonymous) {
        throw new AuthFlowError('already_signed_in', 'Você já está conectado com uma conta.')
      }

      if (user?.is_anonymous) {
        const { error } = await client.auth.updateUser({ email, password: input.password })
        if (error) throw toAuthFlowError(error)
        // O token só passa a dizer is_anonymous=false depois de renovado.
        const refreshed = await client.auth.refreshSession()
        if (refreshed.error) throw toAuthFlowError(refreshed.error)
      } else {
        const { error } = await client.auth.signUp({ email, password: input.password })
        if (error) throw toAuthFlowError(error)
      }

      const { data: after } = await client.auth.getSession()
      const id = after.session?.user.id
      if (!id) throw new AuthFlowError('unknown', MESSAGES.unknown)

      const { error: profileError } = await client
        .from('af1_profiles')
        .upsert(
          { id, nickname: input.nickname.trim(), consent_at: new Date().toISOString() },
          { onConflict: 'id', ignoreDuplicates: true },
        )
      if (profileError) throw toAuthFlowError(profileError)
    },

    /** Entra numa conta existente. A sessão anônima atual é substituída. */
    async signIn(input: SignInInput): Promise<void> {
      const invalid = validateSignIn(input)
      const first = Object.values(invalid)[0]
      if (first) throw new AuthFlowError('validation_failed', first)
      const { error } = await client.auth.signInWithPassword({
        email: input.email.trim().toLowerCase(),
        password: input.password,
      })
      if (error) throw toAuthFlowError(error)
    },

    async signOut(): Promise<void> {
      const { error } = await client.auth.signOut()
      if (error) throw toAuthFlowError(error)
    },
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>

/** Aceita só caminhos internos (evita redirecionar para outro site). */
export function safeReturnPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  return value
}
