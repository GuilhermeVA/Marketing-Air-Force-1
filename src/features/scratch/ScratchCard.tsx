import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Button, durations, easeElegant, useReducedMotion } from '../../ui'
import { BRUSH_RADIUS, computeClearedRatio, REVEAL_THRESHOLD, SAMPLE_STEP } from './scratchMath'

function drawCover(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.round(rect.width * dpr))
  canvas.height = Math.max(1, Math.round(rect.height * dpr))
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalCompositeOperation = 'source-over'

  // "Cinza raspadinha": metal fosco discreto, com linhas finas.
  const g = ctx.createLinearGradient(0, 0, rect.width, rect.height)
  g.addColorStop(0, '#bdb8af')
  g.addColorStop(0.5, '#d9d4cb')
  g.addColorStop(1, '#b3aea5')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, rect.width, rect.height)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  for (let x = -rect.height; x < rect.width; x += 14) {
    ctx.beginPath()
    ctx.moveTo(x, rect.height)
    ctx.lineTo(x + rect.height, 0)
    ctx.stroke()
  }
  ctx.fillStyle = '#2a2a2a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 12px Inter, system-ui, sans-serif'
  ctx.fillText('R A S P E   A Q U I', rect.width / 2, rect.height / 2)
}

type ScratchCardProps = {
  image: { url: string; alt: string } | null
  colorHex: string
  /** true quando o prêmio já foi revelado (ex.: reabertura do link). */
  revealed: boolean
  onReveal: () => void
}

/** Cartão de raspar em canvas 2D, com alternativa por botão (PBI-009). */
export function ScratchCard({ image, colorHex, revealed, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const firedRef = useRef(false)
  const checkScheduled = useRef(false)
  const [done, setDone] = useState(revealed)
  const reduced = useReducedMotion()

  const reveal = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true
    setDone(true)
    onReveal()
  }, [onReveal])

  // Desenha a cobertura e redesenha ao mudar de tamanho (ex.: girar o aparelho).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || done) return
    drawCover(canvas)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => drawCover(canvas))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [done])

  function point(e: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function scratchTo(p: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const from = last.current ?? p
    ctx.globalCompositeOperation = 'destination-out'
    // Opaco: apaga 100% por onde passa (o estilo das linhas da cobertura é translúcido).
    ctx.strokeStyle = '#000'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = BRUSH_RADIUS * 2
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    scheduleCheck()
  }

  // Mede o progresso no máximo uma vez por quadro.
  function scheduleCheck() {
    if (checkScheduled.current) return
    checkScheduled.current = true
    requestAnimationFrame(() => {
      checkScheduled.current = false
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      if (computeClearedRatio(data, canvas.width, SAMPLE_STEP * 2) >= REVEAL_THRESHOLD) reveal()
    })
  }

  return (
    <div>
      <div
        className="relative aspect-[41/31] w-full overflow-hidden rounded-xs border border-line bg-paper"
        style={{ backgroundColor: colorHex + '14' }}
      >
        {image && (
          <img
            src={image.url}
            alt={done ? image.alt : ''}
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
        )}

        {done && !reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 55%, ${colorHex}55, transparent 65%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.35] }}
            transition={{ duration: durations.slow * 2, ease: easeElegant }}
          />
        )}

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={[
            'absolute inset-0 size-full touch-none select-none',
            'transition-opacity duration-[600ms] ease-elegant motion-reduce:transition-none',
            done ? 'pointer-events-none opacity-0' : 'cursor-pointer opacity-100',
          ].join(' ')}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId)
            last.current = null
            scratchTo(point(e))
          }}
          onPointerMove={(e) => {
            if (e.buttons === 0 && e.pointerType === 'mouse') return
            if (last.current) scratchTo(point(e))
          }}
          onPointerUp={() => (last.current = null)}
          onPointerCancel={() => (last.current = null)}
        />
      </div>

      {!done && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-mute">Raspe com o dedo ou</p>
          <Button variant="secondary" onClick={reveal}>
            Revelar
          </Button>
        </div>
      )}
    </div>
  )
}
