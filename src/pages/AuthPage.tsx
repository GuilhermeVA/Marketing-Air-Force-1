import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../features/auth'
import { createAuthApi, safeReturnPath } from '../features/auth/api'
import { AuthForm } from '../features/auth/AuthForm'
import type { AuthMode } from '../features/auth/AuthForm'
import { Button, Screen } from '../ui'

export function AuthPage() {
  const { client, user, isAnonymous } = useAuth()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const api = useMemo(() => createAuthApi(client), [client])

  const mode: AuthMode = params.get('modo') === 'login' ? 'login' : 'cadastro'
  const returnTo = safeReturnPath(params.get('voltar'))

  function changeMode(next: AuthMode) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('modo', next)
    setParams(nextParams, { replace: true })
  }

  if (user && !isAnonymous) {
    return (
      <Screen>
        <h1 className="text-3xl">Você já está conectado</h1>
        <p className="mt-3 text-sm text-mute">{user.email}</p>
        <Button className="mt-8" fullWidth onClick={() => navigate(returnTo, { replace: true })}>
          Continuar
        </Button>
      </Screen>
    )
  }

  return (
    <Screen>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
      <h1 className="mt-3 text-3xl leading-tight">
        {mode === 'cadastro' ? 'Guarde o seu par no closet' : 'Bem-vindo de volta'}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        {mode === 'cadastro'
          ? 'Crie sua conta em segundos. Sem confirmação por e-mail.'
          : 'Entre com o e-mail e a senha do seu cadastro.'}
      </p>
      <div className="mt-10">
        <AuthForm
          mode={mode}
          api={api}
          onModeChange={changeMode}
          onSuccess={() => navigate(returnTo, { replace: true })}
        />
      </div>
      <Link
        to={returnTo}
        className="mt-6 inline-flex min-h-11 items-center text-sm text-mute underline-offset-4 hover:underline"
      >
        Voltar
      </Link>
    </Screen>
  )
}
