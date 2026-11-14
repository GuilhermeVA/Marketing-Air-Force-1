export const SITE_URL = 'https://marketing-air-force-1.vercel.app'

/** Link da campanha com UTM de compartilhamento (medição futura). */
export function campaignShareUrl(origin: string = SITE_URL): string {
  return `${origin}/?utm_source=share&utm_medium=social&utm_campaign=codigo-de-cor`
}

export type ShareData = { title: string; text: string; url: string }
export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/**
 * Abre o menu nativo de compartilhamento (celular). Sem Web Share API, copia o
 * link. Cancelar o menu não é erro.
 */
export async function shareCampaign(
  data: ShareData,
  nav: Navigator = navigator,
): Promise<ShareResult> {
  if (typeof nav.share === 'function') {
    try {
      await nav.share(data)
      return 'shared'
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelled'
      // outros erros (ex.: permissão): tenta copiar o link
    }
  }
  try {
    await nav.clipboard.writeText(data.url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
