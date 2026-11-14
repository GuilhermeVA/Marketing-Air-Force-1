import { Screen, Spinner } from '../ui'

/** Tela exibida enquanto o código de uma rota é baixado no primeiro acesso. */
export function RouteLoading() {
  return (
    <Screen className="flex min-h-dvh items-center justify-center">
      <Spinner />
    </Screen>
  )
}
