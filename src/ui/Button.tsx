import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  fullWidth?: boolean
}

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xs px-6 text-sm font-medium tracking-wide ' +
  'transition-[background-color,color,border-color,opacity] duration-300 ease-elegant motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-ivory hover:bg-graphite',
  secondary: 'border border-line bg-transparent text-ink hover:border-ink',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[base, variants[variant], fullWidth ? 'w-full' : '', className].join(' ').trim()}
      {...props}
    />
  )
}
