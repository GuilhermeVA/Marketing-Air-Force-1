import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { applyAccent, contrastRatio, hexToRgb, softTint } from './color'

describe('softTint', () => {
  it('amount 0 devolve a própria cor e 1 devolve o off-white', () => {
    expect(softTint('#c9a227', 0)).toBe('#c9a227')
    expect(softTint('#c9a227', 1)).toBe('#f7f4ee')
  })

  it('gera um tom claro e próximo da base', () => {
    const tint = softTint('#c9a227')
    expect(contrastRatio(tint, '#f7f4ee')).toBeLessThan(1.3)
    expect(tint).not.toBe('#f7f4ee')
  })

  it('aceita hex curto e rejeita valor inválido', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
    expect(() => softTint('dourado')).toThrow()
  })
})

describe('applyAccent', () => {
  it('define e remove as variáveis de destaque', () => {
    const el = document.createElement('div')
    applyAccent('#c9a227', el)
    expect(el.style.getPropertyValue('--accent')).toBe('#c9a227')
    expect(el.style.getPropertyValue('--accent-soft')).toBe(softTint('#c9a227'))
    applyAccent(null, el)
    expect(el.style.getPropertyValue('--accent')).toBe('')
  })
})

describe('contraste dos tokens (WCAG AA)', () => {
  const css = readFileSync('src/index.css', 'utf-8')
  const token = (name: string) => {
    const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'))
    if (!m) throw new Error(`token ${name} não encontrado`)
    return m[1]
  }

  it.each([
    ['graphite', 'ivory'],
    ['mute', 'ivory'],
    ['ink', 'ivory'],
    ['mute', 'paper'],
    ['ivory', 'ink'],
  ])('%s sobre %s tem contraste >= 4.5', (fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5)
  })

  it('texto principal sobre o tom suave de cores saturadas mantém AA', () => {
    for (const hex of ['#c9a227', '#2f6b4f', '#7a1f2b', '#1f4e8c', '#e4572e']) {
      expect(contrastRatio(token('graphite'), softTint(hex))).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(token('mute'), softTint(hex))).toBeGreaterThanOrEqual(4.5)
    }
  })
})
