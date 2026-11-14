export type ButtonVariant = 'primary' | 'secondary'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xs px-6 text-sm font-medium tracking-wide ' +
  'transition-[background-color,color,border-color,opacity] duration-300 ease-elegant motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-40'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-ivory hover:bg-graphite',
  secondary: 'border border-line bg-transparent text-ink hover:border-ink',
}

/** Classes do botão, para aplicar o mesmo visual em links (<Link className={buttonClass()}>). */
export function buttonClass(variant: ButtonVariant = 'primary', fullWidth = false, extra = '') {
  return [base, variants[variant], fullWidth ? 'w-full' : '', extra].join(' ').trim()
}
