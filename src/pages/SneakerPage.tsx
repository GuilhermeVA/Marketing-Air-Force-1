import { useParams } from 'react-router'

export function SneakerPage() {
  const { slug } = useParams()
  return (
    <main className="p-6">
      <h1 className="text-2xl">Tênis: {slug}</h1>
      <p className="mt-2 text-sm">Em construção.</p>
    </main>
  )
}
