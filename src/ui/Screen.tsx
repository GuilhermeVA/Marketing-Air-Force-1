import type { ReactNode } from 'react'

type ScreenProps = {
  children: ReactNode
  /** Usa o tom suave da cor do tênis ativo como fundo. */
  tinted?: boolean
  className?: string
}

/** Layout base de uma tela mobile: largura máxima, gutters e altura cheia. */
export function Screen({ children, tinted = false, className = '' }: ScreenProps) {
  return (
    <div
      className={[
        'min-h-dvh transition-colors duration-[600ms] ease-elegant motion-reduce:transition-none',
        tinted ? 'bg-accent-soft' : 'bg-ivory',
      ].join(' ')}
    >
      <main className={['mx-auto w-full max-w-md px-6 py-10', className].join(' ').trim()}>
        {children}
      </main>
    </div>
  )
}
