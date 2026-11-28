import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const pedido = (auth?: string) =>
  new Request('http://localhost/api/cron/sincronizar', { headers: auth ? { authorization: auth } : {} })

afterEach(() => vi.unstubAllEnvs())

describe('GET /api/cron/sincronizar', () => {
  it('sem CRON_SECRET configurado, recusa tudo (500)', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const r = await GET(pedido('Bearer qualquer'))
    expect(r.status).toBe(500)
  })

  it('sem cabeçalho ou com segredo errado, devolve 401', async () => {
    vi.stubEnv('CRON_SECRET', 'segredo-certo')
    expect((await GET(pedido())).status).toBe(401)
    expect((await GET(pedido('Bearer errado'))).status).toBe(401)
    expect((await GET(pedido('segredo-certo'))).status).toBe(401)
  })

  it('com segredo certo mas variáveis do Pluggy ausentes, falha com 500 sem vazar detalhes', async () => {
    vi.stubEnv('CRON_SECRET', 'segredo-certo')
    vi.stubEnv('PLUGGY_CLIENT_ID', '')
    vi.stubEnv('PLUGGY_CLIENT_SECRET', '')
    vi.stubEnv('PLUGGY_ITEM_ID', '')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await GET(pedido('Bearer segredo-certo'))
    expect(r.status).toBe(500)
    const corpo = JSON.stringify(await r.json())
    expect(corpo).not.toContain('segredo-certo')
    expect(corpo).not.toContain('PLUGGY_')
  })
})
