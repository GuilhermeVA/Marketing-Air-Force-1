import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { SneakerImage } from '../catalog/api'

type CarouselProps = {
  images: SneakerImage[]
  label: string
}

const arrowClass =
  'absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/85 text-ink ' +
  'transition-opacity duration-300 disabled:opacity-0'

/** Carrossel estilo e-commerce: deslize, setas, teclado, indicadores, miniaturas e zoom (PBI-015). */
export default function Carousel({ images, label }: CarouselProps) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: false, align: 'start' })
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState<SneakerImage | null>(null)

  useEffect(() => {
    if (!embla) return
    const onSelect = () => setIndex(embla.selectedScrollSnap())
    embla.on('select', onSelect)
    return () => {
      embla.off('select', onSelect)
    }
  }, [embla])

  const go = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(images.length - 1, i))
      if (embla) embla.scrollTo(target)
      setIndex(target)
    },
    [embla, images.length],
  )

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1)
    }
  }

  // Esc fecha o zoom.
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setZoomed(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  return (
    <section
      aria-roledescription="carrossel"
      aria-label={label}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className="outline-offset-4"
    >
      <div className="relative">
        <div ref={viewportRef} className="overflow-hidden border border-line bg-paper">
          <div className="flex touch-pan-y">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-[41/31] min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${images.length}`}
              >
                <button
                  type="button"
                  onClick={() => setZoomed(img)}
                  className="block size-full cursor-zoom-in"
                  aria-label={`Ampliar: ${img.alt}`}
                  tabIndex={i === index ? 0 : -1}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    width={820}
                    height={620}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                    draggable={false}
                    className="size-full object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Imagem anterior"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className={`${arrowClass} left-2`}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              aria-label="Próxima imagem"
              onClick={() => go(index + 1)}
              disabled={index === images.length - 1}
              className={`${arrowClass} right-2`}
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
            {images.map((img, i) => (
              <span
                key={img.id}
                className={`h-px w-6 transition-colors duration-300 ${i === index ? 'bg-ink' : 'bg-line'}`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver imagem ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`aspect-[41/31] overflow-hidden border bg-paper transition-colors duration-300 ${
                  i === index ? 'border-ink' : 'border-line'
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Imagem {index + 1} de {images.length}
          </p>
        </>
      )}

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Imagem ampliada: ${zoomed.alt}`}
          className="fixed inset-0 z-50 flex flex-col bg-ivory"
        >
          <div className="flex justify-end p-2">
            <button
              type="button"
              autoFocus
              onClick={() => setZoomed(null)}
              className="min-h-11 px-4 text-sm underline underline-offset-4"
            >
              Fechar
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto [touch-action:pinch-zoom]">
            <img
              src={zoomed.url}
              alt={zoomed.alt}
              className="w-[160%] max-w-none sm:w-full sm:max-w-3xl"
            />
          </div>
        </div>
      )}
    </section>
  )
}
