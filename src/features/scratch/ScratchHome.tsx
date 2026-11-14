import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { applyAccent, Button, buttonClass, Screen, Spinner } from '../../ui'
import { formatNextAvailable } from './api'
import type { ScratchApi, ScratchState } from './api'
import { ScratchCard } from './ScratchCard'

type ScratchHomeProps = {
  api: ScratchApi
  isAnonymous: boolean
  /** Muda quando o usuário muda (ex.: cadastro), para recarregar o estado. */
  userKey: string
}

type View = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; state: ScratchState }

const linkClass = 'inline-flex min-h-11 items-center text-sm underline underline-offset-4'

/** Tela de entrada: verifica a disponibilidade e mostra a raspadinha (PBI-008/009). */
export function ScratchHome({ api, isAnonymous, userKey }: ScratchHomeProps) {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    api
      .getOrCreate()
      .then((state) => active && setView({ kind: 'ready', state }))
      .catch(() => active && setView({ kind: 'error' }))
    return () => {
      active = false
    }
  }, [api, userKey, reloadKey])

  const reload = useCallback(() => {
    setView({ kind: 'loading' })
    setReloadKey((n) => n + 1)
  }, [])

  // Recarrega sozinho quando a próxima raspadinha libera.
  const nextAt =
    view.kind === 'ready' && view.state.status === 'unavailable' ? view.state.nextAvailableAt : null
  useEffect(() => {
    if (!nextAt) return
    const ms = new Date(nextAt).getTime() - Date.now()
    if (ms > 2_147_000_000) return
    const timer = window.setTimeout(reload, Math.max(ms, 0) + 1000)
    return () => window.clearTimeout(timer)
  }, [nextAt, reload])

  // Fundo no tom da cor do par revelado; neutro nos demais estados.
  const revealedColor =
    view.kind === 'ready' &&
    view.state.status === 'available' &&
    view.state.scratch.status !== 'livre'
      ? view.state.sneaker.colorHex
      : null
  useEffect(() => {
    applyAccent(revealedColor)
    return () => applyAccent(null)
  }, [revealedColor])

  if (view.kind === 'loading') {
    return (
      <Screen className="flex min-h-dvh items-center justify-center">
        <Spinner label="Verificando sua raspadinha" />
      </Screen>
    )
  }

  if (view.kind === 'error') {
    return (
      <Screen>
        <h1 className="text-3xl">Algo não saiu como esperado</h1>
        <p className="mt-3 text-sm text-mute">
          Não conseguimos carregar a sua raspadinha. Verifique a conexão.
        </p>
        <Button className="mt-8" onClick={reload}>
          Tentar de novo
        </Button>
      </Screen>
    )
  }

  const { state } = view

  if (state.status === 'available') {
    const { scratch, sneaker } = state
    const revealed = scratch.status !== 'livre'

    function handleReveal() {
      setView({
        kind: 'ready',
        state: {
          ...state,
          status: 'available',
          scratch: { ...scratch, status: 'revelada' },
        } as ScratchState,
      })
      // A revelação já está garantida no servidor (o par foi sorteado antes);
      // se a marcação falhar, a próxima abertura mostra a raspadinha de novo.
      api.markRevealed(scratch.id).catch(() => {})
    }

    return (
      <Screen tinted={revealed}>
        <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
        <h1 className="mt-3 text-3xl leading-tight">
          {revealed
            ? `Seu par: ${sneaker.colorName}`
            : 'Sua próxima reunião merece um pouco de cor'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          {revealed
            ? sneaker.name
            : 'Raspe o cartão para descobrir o Air Force 1 que escolheu você.'}
        </p>

        <div className="mt-8">
          <ScratchCard
            image={sneaker.image}
            colorHex={sneaker.colorHex}
            revealed={revealed}
            onReveal={handleReveal}
          />
        </div>

        {revealed && (
          <div className="mt-8 flex flex-col gap-3">
            {isAnonymous ? (
              <>
                <Link to="/entrar?modo=cadastro&voltar=/" className={buttonClass('primary', true)}>
                  Guardar no meu closet
                </Link>
                <p className="text-center text-xs text-mute">
                  O prêmio fica reservado neste navegador até você se cadastrar.
                </p>
              </>
            ) : (
              <p className="text-sm text-mute">Estamos guardando este par no seu closet.</p>
            )}
          </div>
        )}
      </Screen>
    )
  }

  if (state.status === 'unavailable' && state.reason === 'daily_limit') {
    return (
      <Screen>
        <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
        <h1 className="mt-3 text-3xl leading-tight">Por hoje é só</h1>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Sua próxima raspadinha libera{' '}
          {state.nextAvailableAt ? formatNextAvailable(state.nextAvailableAt) : 'em breve'}.
        </p>
        <Link to="/closet" className={`mt-8 ${linkClass}`}>
          Ver meu closet
        </Link>
      </Screen>
    )
  }

  if (state.status === 'unavailable') {
    return (
      <Screen>
        <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
        <h1 className="mt-3 text-3xl leading-tight">Sua raspadinha já foi usada</h1>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Crie sua conta para ganhar uma raspadinha nova por dia e montar o seu closet.
        </p>
        <Link to="/entrar?modo=cadastro&voltar=/" className={buttonClass('primary', true, 'mt-8')}>
          Criar conta
        </Link>
      </Screen>
    )
  }

  return (
    <Screen>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
      <h1 className="mt-3 text-3xl leading-tight">Coleção completa</h1>
      <p className="mt-3 text-sm leading-relaxed text-graphite">
        Você desbloqueou todos os pares. Cada cor agora é uma mensagem sua.
      </p>
      <Link to="/closet" className={`mt-8 ${linkClass}`}>
        Ver meu closet
      </Link>
    </Screen>
  )
}
