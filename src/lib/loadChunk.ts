const RELOAD_KEY = 'af1.chunk-reload'

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>

/**
 * Carrega uma tela sob demanda. Se o arquivo não existir mais (a aba foi aberta
 * antes de uma publicação nova), recarrega a página uma única vez para buscar a
 * versão atual. Se falhar de novo, repassa o erro para a tela de erro.
 */
export async function loadChunk<T>(
  load: () => Promise<T>,
  { storage = safeSession(), reload = () => window.location.reload() } = {},
): Promise<T> {
  try {
    const mod = await load()
    storage?.removeItem(RELOAD_KEY)
    return mod
  } catch (error) {
    if (storage && !storage.getItem(RELOAD_KEY)) {
      storage.setItem(RELOAD_KEY, '1')
      reload()
      // Mantém a tela de carregamento enquanto a página recarrega.
      return new Promise<T>(() => {})
    }
    throw error
  }
}

function safeSession(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}
