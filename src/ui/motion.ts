/**
 * Movimento do design system. O app inteiro roda dentro de
 * <MotionConfig reducedMotion="user">, então as animações do Motion respeitam
 * prefers-reduced-motion automaticamente; useReducedMotion serve para trocar
 * por versões estáticas quando necessário.
 */
export { useReducedMotion } from 'motion/react'

/** Durações (ms) e curva padrão, alinhadas aos tokens de src/index.css. */
export const durations = { fast: 0.3, base: 0.45, slow: 0.6 } as const
export const easeElegant = [0.22, 1, 0.36, 1] as const
