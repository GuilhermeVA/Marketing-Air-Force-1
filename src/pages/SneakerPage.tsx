import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useAuth } from '../features/auth'
import { createClosetApi } from '../features/closet/api'
import { createScratchApi } from '../features/scratch/api'
import { createSneakerApi } from '../features/sneaker/api'
import { SneakerDetailView } from '../features/sneaker/SneakerDetailView'

export function SneakerPage() {
  const { slug = '' } = useParams()
  const { client, user } = useAuth()
  const api = useMemo(() => createSneakerApi(client), [client])
  const closet = useMemo(() => createClosetApi(client), [client])
  const getScratch = useMemo(() => createScratchApi(client).getOrCreate, [client])

  return (
    <SneakerDetailView
      key={`${user?.id}:${slug}`}
      slug={slug}
      api={api}
      closet={closet}
      getScratch={getScratch}
    />
  )
}
