type SpinnerProps = {
  label?: string
  className?: string
}

/** Indicador de carregamento discreto: círculo de traço fino. */
export function Spinner({ label = 'Carregando', className = '' }: SpinnerProps) {
  return (
    <span role="status" className={['inline-flex items-center gap-3', className].join(' ')}>
      <span
        aria-hidden="true"
        className="size-5 rounded-full border border-line border-t-ink motion-safe:animate-spin"
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
