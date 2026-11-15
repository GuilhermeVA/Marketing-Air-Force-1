import { describe, expect, it, vi } from 'vitest'
import { loadChunk } from './loadChunk'

function memory() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}

describe('loadChunk', () => {
  it('devolve o módulo quando carrega', async () => {
    const reload = vi.fn()
    await expect(loadChunk(async () => 'ok', { storage: memory(), reload })).resolves.toBe('ok')
    expect(reload).not.toHaveBeenCalled()
  })

  it('na primeira falha recarrega a página; na segunda, repassa o erro', async () => {
    const storage = memory()
    const reload = vi.fn()
    const fail = () => Promise.reject(new TypeError('Failed to fetch dynamically imported module'))
    void loadChunk(fail, { storage, reload })
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
    await expect(loadChunk(fail, { storage, reload })).rejects.toThrow('Failed to fetch')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('depois de um carregamento bem-sucedido, volta a permitir um recarregamento', async () => {
    const storage = memory()
    const reload = vi.fn()
    storage.setItem('af1.chunk-reload', '1')
    await loadChunk(async () => 'ok', { storage, reload })
    void loadChunk(() => Promise.reject(new Error('x')), { storage, reload })
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
  })
})
