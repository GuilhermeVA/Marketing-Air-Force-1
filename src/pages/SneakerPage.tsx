import { useParams } from 'react-router'
import { Screen } from '../ui'

export function SneakerPage() {
  const { slug } = useParams()
  return (
    <Screen>
      <h1 className="text-3xl">Tênis: {slug}</h1>
      <p className="mt-2 text-sm text-mute">Em construção.</p>
    </Screen>
  )
}
