import type { ButtonHTMLAttributes } from 'react'
import { buttonClass } from './buttonClass'
import type { ButtonVariant } from './buttonClass'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, fullWidth, className)} {...props} />
}
