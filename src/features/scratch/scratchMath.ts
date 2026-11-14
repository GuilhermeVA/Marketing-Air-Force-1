/** Proporção raspada a partir da qual a cobertura some sozinha. */
export const REVEAL_THRESHOLD = 0.55
export const BRUSH_RADIUS = 26 // px CSS
export const SAMPLE_STEP = 6 // amostra 1 pixel a cada 6, em cada eixo

/**
 * Fração da cobertura já apagada (alfa zero), amostrando os pixels.
 * `data` é o RGBA de getImageData; `width` em pixels.
 */
export function computeClearedRatio(
  data: Uint8ClampedArray,
  width: number,
  step = SAMPLE_STEP,
): number {
  const height = Math.floor(data.length / 4 / width)
  let total = 0
  let cleared = 0
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      total++
      if (data[(y * width + x) * 4 + 3] === 0) cleared++
    }
  }
  return total === 0 ? 0 : cleared / total
}
