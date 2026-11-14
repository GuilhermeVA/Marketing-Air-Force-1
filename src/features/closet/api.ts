import type { SupabaseClient } from '@supabase/supabase-js'
import type { Unlock } from './model'

export function createClosetApi(client: SupabaseClient) {
  return {
    /** Desbloqueios do usuário atual (o RLS filtra pela conta). */
    async listUnlocks(): Promise<Unlock[]> {
      const { data, error } = await client
        .from('af1_unlocks')
        .select('sneaker_id, unlocked_at, is_favorite')
      if (error) throw new Error('Não foi possível carregar o seu closet.', { cause: error })
      return (data ?? []).map(
        (r: { sneaker_id: string; unlocked_at: string; is_favorite: boolean }) => ({
          sneakerId: r.sneaker_id,
          unlockedAt: r.unlocked_at,
          isFavorite: r.is_favorite,
        }),
      )
    },

    /** Marca ou desmarca um par desbloqueado como favorito. */
    async setFavorite(sneakerId: string, isFavorite: boolean): Promise<void> {
      const { data, error } = await client
        .from('af1_unlocks')
        .update({ is_favorite: isFavorite })
        .eq('sneaker_id', sneakerId)
        .select('sneaker_id')
      if (error || !data?.length)
        throw new Error('Não foi possível salvar o favorito.', { cause: error })
    },
  }
}

export type ClosetApi = ReturnType<typeof createClosetApi>
