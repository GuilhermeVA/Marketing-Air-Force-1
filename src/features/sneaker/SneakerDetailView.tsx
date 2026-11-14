import { m } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import {
  applyAccent,
  Button,
  buttonClass,
  durations,
  easeElegant,
  HeartIcon,
  LockIcon,
  Screen,
  Spinner,
} from '../../ui'
import type { ClosetApi } from '../closet/api'
import { formatNextAvailable } from '../scratch/api'
import type { ScratchState } from '../scratch/api'
import type { SneakerApi, SneakerDetail } from './api'

// O carrossel (Embla) só é baixado quando a tela do tênis abre.
const Carousel = lazy(() => import('./Carousel'))

type Props = {
  slug: string
  api: SneakerApi
  closet: Pick<ClosetApi, 'setFavorite'>
  getScratch: () => Promise<ScratchState>
  /** Espaço do botão de compartilhar (PBI-017). */
  shareSlot?: ReactNode
}

type View =
  { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; sneaker: SneakerDetail | null }

const linkClass = 'inline-flex min-h-11 items-center text-sm underline underline-offset-4'

/** Tela de um par: desbloqueado (PBI-015) ou bloqueado (PBI-016). */
export function SneakerDetailView({ slug, api, closet, getScratch, shareSlot }: Props) {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    api
      .getDetail(slug)
      .then((sneaker) => active && setView({ kind: 'ready', sneaker }))
      .catch(() => active && setView({ kind: 'error' }))
    return () => {
      active = false
    }
  }, [api, slug, attempt])

  const accent = view.kind === 'ready' && view.sneaker?.unlocked ? view.sneaker.colorHex : null
  useEffect(() => {
    applyAccent(accent)
    return () => applyAccent(null)
  }, [accent])

  if (view.kind === 'loading') {
    return (
      <Screen className="flex min-h-dvh items-center justify-center">
        <Spinner label="Carregando o tênis" />
      </Screen>
    )
  }

  if (view.kind === 'error') {
    return (
      <Screen>
        <h1 className="text-3xl">Tênis indisponível</h1>
        <p className="mt-3 text-sm text-mute">
          Não conseguimos carregar este par. Verifique a conexão.
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

  const { sneaker } = view
  if (!sneaker) {
    return (
      <Screen>
        <h1 className="text-3xl">Par não encontrado</h1>
        <p className="mt-3 text-sm text-mute">Este tênis não faz parte da coleção.</p>
        <Link to="/closet" className={buttonClass('primary', true, 'mt-8')}>
          Voltar ao closet
        </Link>
      </Screen>
    )
  }

  return sneaker.unlocked ? (
    <Unlocked sneaker={sneaker} closet={closet} shareSlot={shareSlot} />
  ) : (
    <Locked sneaker={sneaker} getScratch={getScratch} />
  )
}

function Header({ sneaker, status }: { sneaker: SneakerDetail; status: ReactNode }) {
  return (
    <>
      <Link to="/closet" className={linkClass}>
        ‹ Closet
      </Link>
      <p className="mt-4 text-xs tracking-[0.2em] text-mute uppercase">{status}</p>
      <h1 className="mt-2 text-3xl leading-tight">{sneaker.colorName}</h1>
      <p className="mt-1 text-sm text-mute">{sneaker.name}</p>
    </>
  )
}

function Unlocked({
  sneaker,
  closet,
  shareSlot,
}: {
  sneaker: SneakerDetail
  closet: Pick<ClosetApi, 'setFavorite'>
  shareSlot?: ReactNode
}) {
  const [favorite, setFavorite] = useState(sneaker.isFavorite)
  const [favError, setFavError] = useState(false)

  async function toggleFavorite() {
    const next = !favorite
    setFavorite(next)
    setFavError(false)
    try {
      await closet.setFavorite(sneaker.id, next)
    } catch {
      setFavorite(!next)
      setFavError(true)
    }
  }

  return (
    <Screen tinted>
      <Header sneaker={sneaker} status="Desbloqueado" />

      <div className="mt-6">
        <Suspense fallback={<div className="aspect-[41/31] border border-line bg-paper" />}>
          <Carousel images={sneaker.images} label={`Imagens do ${sneaker.name}`} />
        </Suspense>
      </div>

      <m.ul
        aria-label="O que esta cor simboliza"
        className="mt-8 flex flex-wrap gap-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
        }}
      >
        {(sneaker.keywords ?? []).map((word) => (
          <m.li
            key={word}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: durations.base, ease: easeElegant }}
            className="border border-ink px-4 py-2 text-xs tracking-[0.18em] text-ink uppercase"
          >
            {word}
          </m.li>
        ))}
      </m.ul>

      <p className="mt-6 font-serif text-lg leading-relaxed text-graphite">{sneaker.meaning}</p>

      <div className="mt-10 flex items-center gap-3 border-t border-line pt-6">
        <Button variant="secondary" onClick={toggleFavorite} aria-pressed={favorite}>
          <HeartIcon filled={favorite} />
          {favorite ? 'Favorito' : 'Favoritar'}
        </Button>
        <div data-slot="compartilhar">{shareSlot}</div>
      </div>
      {favError && (
        <p role="alert" className="mt-3 text-sm text-[#a3271c]">
          Não foi possível salvar o favorito. Tente de novo.
        </p>
      )}
    </Screen>
  )
}

function Locked({
  sneaker,
  getScratch,
}: {
  sneaker: SneakerDetail
  getScratch: () => Promise<ScratchState>
}) {
  const [scratch, setScratch] = useState<ScratchState | null>(null)
  useEffect(() => {
    let active = true
    getScratch()
      .then((s) => active && setScratch(s))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [getScratch])

  const image = sneaker.images[0]
  const available = scratch?.status === 'available'
  const nextAt =
    scratch?.status === 'unavailable' && scratch.reason === 'daily_limit'
      ? scratch.nextAvailableAt
      : null

  return (
    <Screen>
      <Header
        sneaker={sneaker}
        status={
          <span className="inline-flex items-center gap-1">
            <LockIcon className="size-3" /> Bloqueado
          </span>
        }
      />

      <div className="relative mt-6 aspect-[41/31] overflow-hidden border border-line bg-paper">
        {image && (
          <img
            src={image.url}
            alt={`${image.alt} (bloqueado)`}
            width={820}
            height={620}
            fetchPriority="high"
            className="size-full object-cover opacity-60 grayscale"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center text-graphite">
          <span className="flex size-16 items-center justify-center rounded-full bg-paper/85">
            <LockIcon className="size-8" />
          </span>
        </span>
      </div>

      <p className="mt-8 font-serif text-lg leading-relaxed text-graphite">
        Desbloqueie esse tênis para ver o que ele simboliza.
      </p>

      <div className="mt-8">
        {available ? (
          <Link to="/" className={buttonClass('primary', true)}>
            Ir para a raspadinha
          </Link>
        ) : nextAt ? (
          <p className="text-sm text-mute">
            Sua próxima raspadinha libera {formatNextAvailable(nextAt)}.
          </p>
        ) : null}
      </div>
    </Screen>
  )
}
