import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { applyAccent, Button, buttonClass, Screen, Spinner, TextField } from '../../ui'
import { formatNextAvailable } from './api'
import type { RedeemResult, ScratchApi, ScratchState } from './api'
import { HomeShell } from './HomeShell'
import { ScratchCard } from './ScratchCard'

type ScratchHomeProps = {
  api: ScratchApi
  isAnonymous: boolean
  /** Muda quando o usuário muda (ex.: cadastro), para recarregar o estado. */
  userKey: string
}

type View = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; state: ScratchState }

type Redeem =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'error' }
  | { kind: 'done'; result: RedeemResult }

const linkClass = 'inline-flex min-h-11 items-center text-sm underline underline-offset-4'

/** Tela de entrada: verifica a disponibilidade e mostra a raspadinha (PBI-008/009). */
export function ScratchHome({ api, isAnonymous, userKey }: ScratchHomeProps) {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [redeem, setRedeem] = useState<Redeem>({ kind: 'idle' })
  const redeemedFor = useRef<string | null>(null)

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

  // Conta permanente com prêmio revelado: resgata sozinho (RF07 e volta do cadastro).
  const pendingScratchId =
    view.kind === 'ready' &&
    view.state.status === 'available' &&
    view.state.scratch.status === 'revelada' &&
    !isAnonymous
      ? view.state.scratch.id
      : null
  const runRedeem = useCallback(
    (scratchId: string) => {
      redeemedFor.current = scratchId
      setRedeem({ kind: 'pending' })
      api
        .redeem(scratchId)
        .then((result) => setRedeem({ kind: 'done', result }))
        .catch(() => setRedeem({ kind: 'error' }))
    },
    [api],
  )
  useEffect(() => {
    if (pendingScratchId && redeemedFor.current !== pendingScratchId) runRedeem(pendingScratchId)
  }, [pendingScratchId, runRedeem])

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

  if (view.kind === 'loading') return <HomeShell />

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
            ) : redeem.kind === 'done' ? (
              <>
                <p role="status" className="text-sm text-graphite">
                  Guardado no seu closet.
                  {redeem.result.coupon &&
                    ` E você ganhou um cupom de ${redeem.result.coupon.discountPercent}%.`}
                </p>
                <Link
                  to={redeem.result.coupon ? '/cupom' : '/closet'}
                  className={buttonClass('primary', true)}
                >
                  {redeem.result.coupon ? 'Ver meu cupom' : 'Ver meu closet'}
                </Link>
              </>
            ) : redeem.kind === 'error' ? (
              <>
                <p role="alert" className="text-sm text-[#a3271c]">
                  Não conseguimos guardar o par agora. O prêmio continua reservado para você.
                </p>
                <Button fullWidth onClick={() => runRedeem(scratch.id)}>
                  Tentar de novo
                </Button>
              </>
            ) : (
              <p className="flex items-center gap-3 text-sm text-mute">
                <Spinner label="Guardando no seu closet" />
                Guardando no seu closet…
              </p>
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
        <BonusCodeForm
          redeemCode={api.redeemCode}
          onUnlocked={(next) => {
            redeemedFor.current = null
            setRedeem({ kind: 'idle' })
            setView({ kind: 'ready', state: next })
          }}
        />
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

/** Campo para resgatar um código que libera uma raspadinha extra na hora. */
function BonusCodeForm({
  redeemCode,
  onUnlocked,
}: {
  redeemCode: ScratchApi['redeemCode']
  onUnlocked: (state: ScratchState) => void
}) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'invalid' | 'error'>('idle')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setStatus('pending')
    try {
      const next = await redeemCode(code)
      if (next) onUnlocked(next)
      else setStatus('invalid')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 border-t border-line pt-6" noValidate>
      <TextField
        label="Tem um código?"
        value={code}
        onChange={(e) => {
          setCode(e.target.value)
          if (status === 'invalid' || status === 'error') setStatus('idle')
        }}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        error={
          status === 'invalid'
            ? 'Código inválido.'
            : status === 'error'
              ? 'Não conseguimos validar agora. Tente de novo.'
              : undefined
        }
      />
      <Button
        type="submit"
        variant="secondary"
        fullWidth
        className="mt-4"
        disabled={status === 'pending'}
      >
        {status === 'pending' ? 'Validando…' : 'Liberar raspadinha'}
      </Button>
    </form>
  )
}
