import type { Coupon } from './api'
import { formatExpiry } from './api'

const W = 1080
const H = 1350

/** Desenha o ticket do cupom num canvas (imagem 1080x1350 para salvar ou compartilhar). */
export function drawTicket(canvas: HTMLCanvasElement, coupon: Coupon): boolean {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  ctx.fillStyle = '#f7f4ee'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#dcd6cc'
  ctx.lineWidth = 2
  ctx.strokeRect(90, 150, W - 180, H - 300)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#5f5b55'
  ctx.font = '500 30px Inter, system-ui, sans-serif'
  ctx.fillText('C Ó D I G O   D E   C O R', W / 2, 270)

  ctx.fillStyle = '#121212'
  ctx.font = '500 200px "Playfair Display", Georgia, serif'
  ctx.fillText(`${coupon.discountPercent}%`, W / 2, 560)
  ctx.font = '400 40px Inter, system-ui, sans-serif'
  ctx.fillStyle = '#2a2a2a'
  ctx.fillText('de desconto no seu Air Force 1', W / 2, 640)

  ctx.setLineDash([10, 12])
  ctx.beginPath()
  ctx.moveTo(150, 740)
  ctx.lineTo(W - 150, 740)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#5f5b55'
  ctx.font = '500 28px Inter, system-ui, sans-serif'
  ctx.fillText('C Ó D I G O', W / 2, 840)
  ctx.fillStyle = '#121212'
  ctx.font = '600 110px Inter, system-ui, sans-serif'
  ctx.fillText(coupon.code, W / 2, 960)

  ctx.fillStyle = '#2a2a2a'
  ctx.font = '400 36px Inter, system-ui, sans-serif'
  ctx.fillText(`Válido até ${formatExpiry(coupon.expiresAt)}`, W / 2, 1060)

  ctx.fillStyle = '#5f5b55'
  ctx.font = '400 26px Inter, system-ui, sans-serif'
  ctx.fillText('Campanha acadêmica simulada. Cupom fictício.', W / 2, H - 90)
  return true
}

/** Gera o PNG do ticket e compartilha (celular) ou baixa o arquivo. */
export async function saveTicketImage(coupon: Coupon): Promise<'shared' | 'downloaded' | 'failed'> {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  if (!drawTicket(canvas, coupon)) return 'failed'
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return 'failed'

  const fileName = `cupom-${coupon.code}.png`
  const file = new File([blob], fileName, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Meu cupom Código de Cor' })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'shared'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
