import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, TextField } from '../../ui'
import { MIN_PASSWORD_LENGTH, toAuthFlowError, validateSignIn, validateSignUp } from './api'
import type { AuthApi } from './api'

export type AuthMode = 'cadastro' | 'login'

type AuthFormProps = {
  mode: AuthMode
  api: Pick<AuthApi, 'signUp' | 'signIn'>
  onSuccess: () => void
  onModeChange: (mode: AuthMode) => void
}

type Errors = Partial<Record<'nickname' | 'email' | 'password' | 'consent', string>>

export function AuthForm({ mode, api, onSuccess, onModeChange }: AuthFormProps) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'cadastro'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    const found = isSignUp
      ? validateSignUp({ nickname, email, password, consent })
      : validateSignIn({ email, password })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      if (isSignUp) await api.signUp({ nickname, email, password, consent })
      else await api.signIn({ email, password })
      onSuccess()
    } catch (error) {
      setFormError(toAuthFlowError(error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-pressed={showPassword}
      className="min-h-11 shrink-0 px-2 text-xs tracking-wide text-mute underline-offset-4 hover:text-ink hover:underline"
    >
      {showPassword ? 'Ocultar' : 'Mostrar'}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {isSignUp && (
        <TextField
          label="Como podemos te chamar"
          name="nickname"
          autoComplete="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={errors.nickname}
          maxLength={40}
        />
      )}
      <TextField
        label="E-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextField
        label="Senha"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint={isSignUp ? `Mínimo de ${MIN_PASSWORD_LENGTH} caracteres.` : undefined}
        trailing={passwordToggle}
      />

      {isSignUp && (
        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-graphite">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-invalid={errors.consent ? true : undefined}
              className="mt-1 size-5 shrink-0 accent-ink"
            />
            <span>
              Li e aceito o{' '}
              <Link to="/privacidade" className="underline underline-offset-4" target="_blank">
                termo de privacidade
              </Link>
              . Meus dados são usados só nesta campanha acadêmica.
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-[#a3271c]">{errors.consent}</p>}
        </div>
      )}

      {formError && (
        <p role="alert" className="border-l-2 border-[#a3271c] pl-3 text-sm text-[#a3271c]">
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={submitting || (isSignUp && !consent)}>
        {submitting ? 'Aguarde…' : isSignUp ? 'Criar conta e guardar' : 'Entrar'}
      </Button>

      <p className="text-center text-sm text-mute">
        {isSignUp ? 'Já tem conta? ' : 'Ainda não tem conta? '}
        <button
          type="button"
          onClick={() => {
            setErrors({})
            setFormError(null)
            onModeChange(isSignUp ? 'login' : 'cadastro')
          }}
          className="min-h-11 text-ink underline underline-offset-4"
        >
          {isSignUp ? 'Entrar' : 'Criar conta'}
        </button>
      </p>
    </form>
  )
}
