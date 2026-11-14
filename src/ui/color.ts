/** Utilitários de cor do design system: tom suave do destaque e contraste WCAG. */

type Rgb = [number, number, number]

const IVORY = '#f7f4ee'

export function hexToRgb(hex: string): Rgb {
  const clean = hex.trim().replace(/^#/, '')
  const full = clean.length === 3 ? [...clean].map((c) => c + c).join('') : clean
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Cor hex inválida: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb
}

export function rgbToHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

/**
 * Mistura a cor com o off-white da base. `amount` é a proporção do off-white
 * (0 = cor pura, 1 = off-white puro). O padrão gera um fundo bem suave.
 */
export function softTint(hex: string, amount = 0.86, base = IVORY): string {
  if (amount < 0 || amount > 1) throw new Error('amount deve estar entre 0 e 1')
  const c = hexToRgb(hex)
  const b = hexToRgb(base)
  return rgbToHex(c.map((v, i) => v * (1 - amount) + b[i] * amount) as Rgb)
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste WCAG entre duas cores (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Aplica a cor do tênis ativo como destaque da tela (--accent e --accent-soft). */
export function applyAccent(hex: string | null, root: HTMLElement = document.documentElement) {
  if (!hex) {
    root.style.removeProperty('--accent')
    root.style.removeProperty('--accent-soft')
    return
  }
  root.style.setProperty('--accent', hex)
  root.style.setProperty('--accent-soft', softTint(hex))
}
