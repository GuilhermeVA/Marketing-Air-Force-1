import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../features/auth'
import { createAuthApi, toAuthFlowError } from '../features/auth/api'
import { Button, Screen } from '../ui'

export function ClosetPage() {
  const { client, user, isAnonymous } = useAuth()
  const api = useMemo(() => createAuthApi(client), [client])
  const [error, setError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  async function handleSignOut() {
    setError(null)
    setLeaving(true)
    try {
      await api.signOut()
    } catch (e) {
      setError(toAuthFlowError(e).message)
    } finally {
      setLeaving(false)
    }
  }

  return (
    <Screen>
      <h1 className="text-3xl">Closet</h1>
      <p className="mt-2 text-sm text-mute">Em construção.</p>
      {!isAnonymous && (
        <Link
          to="/cupom"
          className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Meu cupom
        </Link>
      )}

      <div className="mt-10 border-t border-line pt-6">
        {isAnonymous ? (
          <Link
            to="/entrar?modo=login&voltar=/closet"
            className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
          >
            Já tem conta? Entrar
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="truncate text-sm text-mute">{user?.email}</p>
            <Button variant="secondary" onClick={handleSignOut} disabled={leaving}>
              Sair
            </Button>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-[#a3271c]">
            {error}
          </p>
        )}
      </div>
    </Screen>
  )
}
