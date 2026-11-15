import { Button, Screen } from '../ui'

/** Tela amigável para erros inesperados (ex.: falha ao baixar uma tela após uma publicação). */
export function RouteError() {
  return (
    <Screen>
      <h1 className="text-3xl">Algo não saiu como esperado</h1>
      <p className="mt-3 text-sm text-mute">
        Pode ser uma versão nova do site ou uma falha de conexão. Recarregue para continuar.
      </p>
      <Button className="mt-8" onClick={() => window.location.reload()}>
        Recarregar
      </Button>
    </Screen>
  )
}
