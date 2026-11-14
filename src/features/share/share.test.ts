import { describe, expect, it, vi } from 'vitest'
import { campaignShareUrl, shareCampaign } from './share'

const data = { title: 'T', text: 'X', url: 'https://exemplo.app/?utm_source=share' }
const nav = (overrides: Partial<Navigator>) =>
  ({ clipboard: { writeText: vi.fn(async () => {}) }, ...overrides }) as unknown as Navigator

describe('shareCampaign', () => {
  it('usa o menu nativo quando existe', async () => {
    const share = vi.fn(async () => {})
    expect(await shareCampaign(data, nav({ share }))).toBe('shared')
    expect(share).toHaveBeenCalledWith(data)
  })

  it('sem Web Share API, copia o link', async () => {
    const n = nav({ share: undefined })
    expect(await shareCampaign(data, n)).toBe('copied')
    expect(n.clipboard.writeText).toHaveBeenCalledWith(data.url)
  })

  it('cancelar o menu nativo não é erro', async () => {
    const share = vi.fn(async () => {
      throw Object.assign(new Error('cancelado'), { name: 'AbortError' })
    })
    const n = nav({ share })
    expect(await shareCampaign(data, n)).toBe('cancelled')
    expect(n.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('falha geral retorna failed', async () => {
    const n = {
      clipboard: { writeText: vi.fn(async () => Promise.reject(new Error('x'))) },
    } as unknown as Navigator
    expect(await shareCampaign(data, n)).toBe('failed')
  })
})

describe('campaignShareUrl', () => {
  it('leva para a raspadinha com UTM de compartilhamento', () => {
    expect(campaignShareUrl('https://a.app')).toBe(
      'https://a.app/?utm_source=share&utm_medium=social&utm_campaign=codigo-de-cor',
    )
  })
})
