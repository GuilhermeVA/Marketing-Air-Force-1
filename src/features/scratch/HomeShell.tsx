import { Screen, Spinner } from '../../ui'

/**
 * Estrutura da tela inicial exibida já no primeiro quadro, enquanto a sessão e a
 * raspadinha carregam: o visitante vê a proposta imediatamente.
 */
export function HomeShell() {
  return (
    <Screen>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
      <h1 className="mt-3 text-3xl leading-tight">Sua próxima reunião merece um pouco de cor</h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        Raspe o cartão para descobrir o Air Force 1 que escolheu você.
      </p>
      <div
        className="mt-8 flex aspect-[41/31] w-full items-center justify-center rounded-xs border border-line bg-gradient-to-br from-[#bdb8af] via-[#d9d4cb] to-[#b3aea5]"
        aria-hidden="true"
      />
      <div className="mt-4 flex justify-center">
        <Spinner label="Preparando sua raspadinha" />
      </div>
    </Screen>
  )
}
