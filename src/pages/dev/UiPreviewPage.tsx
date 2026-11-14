import { m } from 'motion/react'
import { useState } from 'react'
import {
  applyAccent,
  Button,
  durations,
  easeElegant,
  Screen,
  Spinner,
  useReducedMotion,
} from '../../ui'

const sampleColors = [
  { name: 'Neutro', hex: null },
  { name: 'Dourado', hex: '#c9a227' },
  { name: 'Verde', hex: '#2f6b4f' },
  { name: 'Vinho', hex: '#7a1f2b' },
  { name: 'Azul', hex: '#1f4e8c' },
]

/** Página de amostra do design system. Só existe em desenvolvimento (/dev/ui). */
export function UiPreviewPage() {
  const [active, setActive] = useState<string | null>(null)
  const reduced = useReducedMotion()

  function choose(hex: string | null) {
    setActive(hex)
    applyAccent(hex)
  }

  return (
    <Screen tinted>
      <p className="text-xs tracking-[0.2em] text-mute uppercase">Design system</p>
      <h1 className="mt-3 text-4xl leading-tight">
        Sua próxima reunião merece um pouco de código de cor
      </h1>
      <p className="mt-4 text-base leading-relaxed text-graphite">
        Base neutra, linhas finas e uma única cor de destaque por vez, a do tênis.
      </p>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-xl">Cor de destaque</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {sampleColors.map((c) => (
            <Button
              key={c.name}
              variant={active === c.hex ? 'primary' : 'secondary'}
              onClick={() => choose(c.hex)}
              aria-pressed={active === c.hex}
            >
              {c.name}
            </Button>
          ))}
        </div>
        <div className="mt-4 h-16 rounded-xs border border-line bg-accent" aria-hidden="true" />
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-xl">Botões</h2>
        <div className="mt-4 flex flex-col gap-3">
          <Button fullWidth>Raspar agora</Button>
          <Button variant="secondary" fullWidth>
            Ver meu closet
          </Button>
          <Button fullWidth disabled>
            Indisponível
          </Button>
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-xl">Carregando</h2>
        <Spinner className="mt-4" />
      </section>

      <section className="mt-10 border-t border-line pt-6">
        <h2 className="text-xl">Movimento</h2>
        <p className="mt-2 text-sm text-mute">
          Movimento reduzido do sistema: {reduced ? 'ligado (versão estática)' : 'desligado'}
        </p>
        <m.div
          key={active ?? 'neutro'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.slow, ease: easeElegant }}
          className="mt-4 rounded-xs border border-line bg-paper p-6"
        >
          <p className="font-serif text-2xl text-ink">Dourado</p>
          <p className="mt-1 text-sm text-mute">Riqueza · Prosperidade</p>
        </m.div>
      </section>
    </Screen>
  )
}
