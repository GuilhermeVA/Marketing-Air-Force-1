import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../features/auth'
import { createAuthApi, toAuthFlowError } from '../features/auth/api'
import { createCatalogApi } from '../features/catalog/api'
import { createClosetApi } from '../features/closet/api'
import { ClosetView } from '../features/closet/ClosetView'
import { createScratchApi } from '../features/scratch/api'
import { Button } from '../ui'

export function ClosetPage() {
  const { client, user, isAnonymous } = useAuth()
  const catalog = useMemo(() => createCatalogApi(client), [client])
  const closet = useMemo(() => createClosetApi(client), [client])
  const getScratch = useMemo(() => createScratchApi(client).getOrCreate, [client])

  return (
    <ClosetView
      key={user?.id}
      catalog={catalog}
      closet={closet}
      getScratch={getScratch}
      isAnonymous={isAnonymous}
      account={<AccountFooter />}
    />
  )
}

function AccountFooter() {
  const { client, user, isAnonymous } = useAuth()
  const api = useMemo(() => createAuthApi(client), [client])
  const [error, setError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  async function handleSignOut() {
    setError(null)
    setLeaving(true)
    try {
      await api.signOut()
    } catch (e) {
      setError(toAuthFlowError(e).message)
    } finally {
      setLeaving(false)
    }
  }

  return (
    <>
      {isAnonymous ? (
        <Link
          to="/entrar?modo=login&voltar=/closet"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          Já tem conta? Entrar
        </Link>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="truncate text-sm text-mute">{user?.email}</p>
          <Button variant="secondary" onClick={handleSignOut} disabled={leaving}>
            Sair
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#a3271c]">
          {error}
        </p>
      )}
    </>
  )
}
