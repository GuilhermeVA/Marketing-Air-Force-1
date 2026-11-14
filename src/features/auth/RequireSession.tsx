import { Outlet } from 'react-router'
import { Button, Screen, Spinner } from '../../ui'
import { useAuth } from './context'

/**
 * Só renderiza as telas filhas quando há sessão (anônima ou com conta), para
 * que nenhuma chamada ao banco aconteça antes disso.
 */
export function RequireSession() {
  const { user, loading, error, retry } = useAuth()

  if (error && !user) {
    return (
      <Screen>
        <h1 className="text-2xl">Não conseguimos abrir a experiência</h1>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          Verifique sua conexão com a internet e tente de novo.
        </p>
        <Button className="mt-8" onClick={retry}>
          Tentar de novo
        </Button>
      </Screen>
    )
  }

  if (loading || !user) {
    return (
      <Screen className="flex min-h-dvh items-center justify-center">
        <Spinner label="Preparando sua experiência" />
      </Screen>
    )
  }

  return <Outlet />
}
