import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  error?: string
  hint?: string
  /** Elemento à direita do campo (ex.: botão de mostrar senha). */
  trailing?: ReactNode
}

/** Campo de texto com rótulo, dica e erro acessíveis. */
export function TextField({
  label,
  error,
  hint,
  trailing,
  className = '',
  ...props
}: TextFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs tracking-[0.12em] text-mute uppercase">
        {label}
      </label>
      <div
        className={[
          'mt-2 flex items-center border-b transition-colors duration-300 motion-reduce:transition-none',
          error ? 'border-[#a3271c]' : 'border-line focus-within:border-ink',
        ].join(' ')}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-h-11 w-full bg-transparent py-2 text-base text-ink outline-none placeholder:text-mute/70"
          {...props}
        />
        {trailing}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-xs text-[#a3271c]">
          {error}
        </p>
      )}
    </div>
  )
}
