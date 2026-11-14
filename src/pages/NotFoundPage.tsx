import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl">Página não encontrada</h1>
      <Link to="/" className="mt-4 inline-block underline">
        Voltar ao início
      </Link>
    </main>
  )
}
