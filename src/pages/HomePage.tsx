import { useMemo } from 'react'
import { useAuth } from '../features/auth'
import { createScratchApi } from '../features/scratch/api'
import { ScratchHome } from '../features/scratch/ScratchHome'

export function HomePage() {
  const { client, user, isAnonymous } = useAuth()
  const api = useMemo(() => createScratchApi(client), [client])
  return <ScratchHome api={api} isAnonymous={isAnonymous} userKey={`${user?.id}:${isAnonymous}`} />
}
