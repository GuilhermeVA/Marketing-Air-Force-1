import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button, buttonClass, durations, easeElegant, Screen, Spinner } from '../../ui'
import { copyText, formatExpiry, isExpired } from './api'
import type { Coupon, CouponApi } from './api'
import { saveTicketImage } from './ticketImage'

type View = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; coupon: Coupon | null }

const linkClass = 'inline-flex min-h-11 items-center text-sm underline underline-offset-4'

/** Tela do cupom (PBI-012). */
export function CouponView({ api }: { api: CouponApi }) {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api
      .getMyCoupon()
      .then((coupon) => active && setView({ kind: 'ready', coupon }))
      .catch(() => active && setView({ kind: 'error' }))
    return () => {
      active = false
    }
  }, [api, attempt])

  if (view.kind === 'loading') {
    return (
      <Screen className="flex min-h-dvh items-center justify-center">
        <Spinner label="Carregando o seu cupom" />
      </Screen>
    )
  }

  if (view.kind === 'error') {
    return (
      <Screen>
        <h1 className="text-3xl">Cupom indisponível</h1>
        <p className="mt-3 text-sm text-mute">
          Não conseguimos carregar o seu cupom. Verifique a conexão.
        </p>
        <Button
          className="mt-8"
          onClick={() => {
            setView({ kind: 'loading' })
            setAttempt((n) => n + 1)
          }}
        >
          Tentar de novo
        </Button>
      </Screen>
    )
  }

  const { coupon } = view
  if (!coupon) {
    return (
      <Screen>
        <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
        <h1 className="mt-3 text-3xl leading-tight">Você ainda não tem cupom</h1>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Raspe, guarde o seu primeiro par no closet e ganhe um cupom de desconto.
        </p>
        <Link to="/" className={buttonClass('primary', true, 'mt-8')}>
          Ir para a raspadinha
        </Link>
      </Screen>
    )
  }

  const expired = isExpired(coupon)

  async function handleCopy() {
    setFeedback(
      (await copyText(coupon!.code))
        ? 'Código copiado'
        : 'Não foi possível copiar. Selecione o código acima.',
    )
  }

  async function handleSave() {
    const result = await saveTicketImage(coupon!)
    setFeedback(
      result === 'failed'
        ? 'Não foi possível gerar a imagem.'
        : result === 'downloaded'
          ? 'Imagem salva'
          : null,
    )
  }

  return (
    <Screen>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
      <h1 className="mt-3 text-3xl leading-tight">Seu cupom</h1>

      <motion.section
        aria-label="Cupom"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: durations.slow, ease: easeElegant }}
        className="relative mt-8 overflow-hidden border border-line bg-paper px-6 py-8 text-center"
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          initial={{ x: '0%' }}
          animate={{ x: '400%' }}
          transition={{ duration: 1.2, delay: 0.4, ease: easeElegant }}
        />
        <p className="font-serif text-6xl text-ink">{coupon.discountPercent}%</p>
        <p className="mt-2 text-sm text-graphite">de desconto no seu Air Force 1</p>
        <div className="my-6 border-t border-dashed border-line" />
        <p className="text-xs tracking-[0.2em] text-mute uppercase">Código</p>
        <p className="mt-2 text-3xl font-semibold tracking-[0.12em] text-ink select-all">
          {coupon.code}
        </p>
        <p className={`mt-4 text-sm ${expired ? 'text-[#a3271c]' : 'text-graphite'}`}>
          {expired
            ? `Expirou em ${formatExpiry(coupon.expiresAt)}`
            : `Válido até ${formatExpiry(coupon.expiresAt)}`}
        </p>
      </motion.section>

      <div className="mt-6 flex flex-col gap-3">
        <Button fullWidth onClick={handleCopy}>
          Copiar código
        </Button>
        <Button variant="secondary" fullWidth onClick={handleSave}>
          Salvar como imagem
        </Button>
        <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-mute">
          {feedback}
        </p>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-mute">
        Apresente o código na loja ao comprar o seu Air Force 1. Campanha acadêmica simulada, sem
        vínculo com a Nike: o cupom é fictício.
      </p>
      <Link to="/closet" className={`mt-6 ${linkClass}`}>
        Ver meu closet
      </Link>
    </Screen>
  )
}
