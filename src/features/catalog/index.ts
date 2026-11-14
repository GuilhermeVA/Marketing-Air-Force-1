import { supabase } from '../../lib/supabase'
import { createCatalogApi } from './api'

export type { CatalogApi, Rarity, Sneaker, SneakerImage } from './api'
export { CatalogError } from './api'

/** Instância do catálogo ligada ao cliente do app. */
export const catalogApi = createCatalogApi(supabase)
