import { Link } from 'react-router'
import { Screen } from '../ui'

export function NotFoundPage() {
  return (
    <Screen>
      <h1 className="text-3xl">Página não encontrada</h1>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
      >
        Voltar ao início
      </Link>
    </Screen>
  )
}
