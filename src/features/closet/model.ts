import type { Sneaker } from '../catalog/api'

export type Unlock = {
  sneakerId: string
  unlockedAt: string
  isFavorite: boolean
}

export type ClosetItem = {
  sneaker: Sneaker
  unlocked: boolean
  unlockedAt: string | null
  isFavorite: boolean
}

/** Cruza o catálogo com os desbloqueios do usuário, na ordem do catálogo. */
export function buildCloset(sneakers: Sneaker[], unlocks: Unlock[]): ClosetItem[] {
  const byId = new Map(unlocks.map((u) => [u.sneakerId, u]))
  return sneakers.map((sneaker) => {
    const u = byId.get(sneaker.id)
    return {
      sneaker,
      unlocked: !!u,
      unlockedAt: u?.unlockedAt ?? null,
      isFavorite: u?.isFavorite ?? false,
    }
  })
}

export type SortMode = 'catalogo' | 'favoritos' | 'desbloqueados' | 'recentes'

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'catalogo', label: 'Coleção' },
  { value: 'favoritos', label: 'Favoritos primeiro' },
  { value: 'desbloqueados', label: 'Desbloqueados primeiro' },
  { value: 'recentes', label: 'Mais recentes' },
]

/** Ordena o closet sem alterar a lista original; empates mantêm a ordem do catálogo. */
export function sortCloset(items: ClosetItem[], mode: SortMode): ClosetItem[] {
  const byCatalog = (a: ClosetItem, b: ClosetItem) => a.sneaker.sortOrder - b.sneaker.sortOrder
  const sorted = [...items]
  switch (mode) {
    case 'favoritos':
      return sorted.sort(
        (a, b) =>
          Number(b.isFavorite) - Number(a.isFavorite) ||
          Number(b.unlocked) - Number(a.unlocked) ||
          byCatalog(a, b),
      )
    case 'desbloqueados':
      return sorted.sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || byCatalog(a, b))
    case 'recentes':
      return sorted.sort(
        (a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? '') || byCatalog(a, b),
      )
    default:
      return sorted.sort(byCatalog)
  }
}

const SORT_KEY = 'af1.closet.sort'

export function loadSortMode(): SortMode {
  try {
    const v = localStorage.getItem(SORT_KEY)
    if (SORT_OPTIONS.some((o) => o.value === v)) return v as SortMode
  } catch {
    // armazenamento indisponível (aba privada, bloqueio): usa o padrão
  }
  return 'catalogo'
}

export function saveSortMode(mode: SortMode) {
  try {
    localStorage.setItem(SORT_KEY, mode)
  } catch {
    // ignora: a ordenação só não fica lembrada
  }
}
