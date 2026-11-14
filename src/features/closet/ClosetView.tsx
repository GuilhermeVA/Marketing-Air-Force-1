import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import {
  Button,
  buttonClass,
  durations,
  easeElegant,
  HeartIcon,
  LockIcon,
  Screen,
  Spinner,
} from '../../ui'
import type { CatalogApi } from '../catalog/api'
import { formatNextAvailable } from '../scratch/api'
import type { ScratchState } from '../scratch/api'
import type { ClosetApi } from './api'
import { buildCloset, loadSortMode, saveSortMode, SORT_OPTIONS, sortCloset } from './model'
import type { ClosetItem, SortMode } from './model'

type ClosetViewProps = {
  catalog: Pick<CatalogApi, 'listSneakers'>
  closet: ClosetApi
  /** Estado da raspadinha, para o atalho (opcional: falha não impede o closet). */
  getScratch: () => Promise<ScratchState>
  isAnonymous: boolean
  /** Rodapé com dados da conta (entrar/sair). */
  account: ReactNode
}

type View = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; items: ClosetItem[] }

const linkClass = 'inline-flex min-h-11 items-center text-sm underline underline-offset-4'

function scratchLabel(state: ScratchState | null): string | null {
  if (!state) return null
  if (state.status === 'available') {
    return state.scratch.status === 'livre'
      ? 'Sua raspadinha está disponível'
      : 'Você tem um prêmio para guardar'
  }
  if (state.status === 'unavailable' && state.reason === 'daily_limit' && state.nextAvailableAt) {
    return `Próxima raspadinha ${formatNextAvailable(state.nextAvailableAt)}`
  }
  if (state.status === 'all_unlocked') return 'Coleção completa'
  return null
}

/** Closet: todos os pares do catálogo, desbloqueados em cor e bloqueados em cinza (PBI-013). */
export function ClosetView({ catalog, closet, getScratch, isAnonymous, account }: ClosetViewProps) {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [scratch, setScratch] = useState<ScratchState | null>(null)
  const [sort, setSort] = useState<SortMode>(loadSortMode)
  const [favError, setFavError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([catalog.listSneakers(), closet.listUnlocks()])
      .then(
        ([sneakers, unlocks]) =>
          active && setView({ kind: 'ready', items: buildCloset(sneakers, unlocks) }),
      )
      .catch(() => active && setView({ kind: 'error' }))
    getScratch()
      .then((s) => active && setScratch(s))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [catalog, closet, getScratch, attempt])

  if (view.kind === 'loading') {
    return (
      <Screen className="flex min-h-dvh items-center justify-center">
        <Spinner label="Carregando o seu closet" />
      </Screen>
    )
  }

  if (view.kind === 'error') {
    return (
      <Screen>
        <h1 className="text-3xl">Closet indisponível</h1>
        <p className="mt-3 text-sm text-mute">
          Não conseguimos carregar o seu closet. Verifique a conexão.
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

  const { items } = view

  // Favoritar com atualização otimista; desfaz se o servidor recusar.
  async function toggleFavorite(sneakerId: string) {
    if (view.kind !== 'ready') return
    const target = view.items.find((i) => i.sneaker.id === sneakerId)
    if (!target?.unlocked) return
    const next = !target.isFavorite
    const apply = (value: boolean) =>
      setView((v) =>
        v.kind === 'ready'
          ? {
              ...v,
              items: v.items.map((i) =>
                i.sneaker.id === sneakerId ? { ...i, isFavorite: value } : i,
              ),
            }
          : v,
      )
    setFavError(null)
    apply(next)
    try {
      await closet.setFavorite(sneakerId, next)
    } catch {
      apply(!next)
      setFavError('Não foi possível salvar o favorito. Tente de novo.')
    }
  }
  const unlockedCount = items.filter((i) => i.unlocked).length
  const label = scratchLabel(scratch)

  return (
    <Screen>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Código de Cor</p>
      <h1 className="mt-3 text-3xl">Seu closet</h1>
      <p className="mt-2 text-sm text-mute">
        {unlockedCount} de {items.length} pares
      </p>

      {unlockedCount === 0 && (
        <div className="mt-6 border border-line bg-paper p-5">
          <p className="text-sm leading-relaxed text-graphite">
            {isAnonymous
              ? 'Raspe a sua raspadinha e crie sua conta para guardar o primeiro par.'
              : 'Raspe a sua raspadinha para desbloquear o primeiro par.'}
          </p>
          <Link to="/" className={buttonClass('primary', true, 'mt-4')}>
            Ir para a raspadinha
          </Link>
        </div>
      )}

      {unlockedCount > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <label htmlFor="closet-sort" className="text-xs tracking-[0.12em] text-mute uppercase">
            Ordenar
          </label>
          <select
            id="closet-sort"
            value={sort}
            onChange={(e) => {
              const mode = e.target.value as SortMode
              setSort(mode)
              saveSortMode(mode)
            }}
            className="min-h-11 border-b border-line bg-transparent text-sm text-ink focus:border-ink"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {favError && (
        <p role="alert" className="mt-3 text-sm text-[#a3271c]">
          {favError}
        </p>
      )}

      <motion.ul
        className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {sortCloset(items, sort).map((item) => (
          <ClosetCard key={item.sneaker.id} item={item} onToggleFavorite={toggleFavorite} />
        ))}
      </motion.ul>

      <nav aria-label="Atalhos" className="mt-10 flex flex-col border-t border-line pt-4">
        <Link to="/" className={linkClass}>
          {label ?? 'Raspadinha'}
        </Link>
        {!isAnonymous && (
          <Link to="/cupom" className={linkClass}>
            Meu cupom
          </Link>
        )}
      </nav>

      <div className="mt-6 border-t border-line pt-6">{account}</div>
    </Screen>
  )
}

function ClosetCard({
  item,
  onToggleFavorite,
}: {
  item: ClosetItem
  onToggleFavorite: (sneakerId: string) => void
}) {
  const { sneaker, unlocked } = item
  const image = sneaker.images[0]
  const name = `${sneaker.colorName}${unlocked ? '' : ', bloqueado'}`

  return (
    <motion.li
      className="relative"
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: durations.base, ease: easeElegant }}
    >
      <Link
        to={`/tenis/${sneaker.slug}`}
        aria-label={name}
        className="group block focus-visible:outline-offset-4"
      >
        <div
          className={[
            'relative aspect-[41/31] overflow-hidden border border-line bg-paper',
            'transition-transform duration-300 ease-elegant motion-safe:group-hover:[transform:perspective(600px)_rotateX(4deg)_translateY(-2px)]',
          ].join(' ')}
        >
          {image && (
            <img
              src={image.url}
              alt=""
              width={410}
              height={310}
              loading="lazy"
              decoding="async"
              className={`size-full object-cover ${unlocked ? '' : 'opacity-60 grayscale'}`}
            />
          )}
          {!unlocked && (
            <span className="absolute inset-0 flex items-center justify-center text-graphite">
              <span className="flex size-12 items-center justify-center rounded-full bg-paper/85">
                <LockIcon className="size-6" />
              </span>
            </span>
          )}
        </div>
        <p className="mt-3 font-serif text-lg leading-tight text-ink">{sneaker.colorName}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-mute">
          {unlocked ? (
            'Desbloqueado'
          ) : (
            <>
              <LockIcon className="size-3" /> Bloqueado
            </>
          )}
        </p>
      </Link>
      {unlocked && (
        <button
          type="button"
          onClick={() => onToggleFavorite(sneaker.id)}
          aria-pressed={item.isFavorite}
          aria-label={`Favorito: ${sneaker.colorName}`}
          className="absolute top-1 right-1 flex size-11 items-center justify-center text-ink"
        >
          <HeartIcon filled={item.isFavorite} />
        </button>
      )}
    </motion.li>
  )
}
