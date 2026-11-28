import { describe, expect, it, vi } from 'vitest'
import { criarClientePluggy, diasParaVencerAutorizacao, ErroPluggy } from './cliente'

const config = { clientId: 'cid', clientSecret: 'csecret', itemId: 'item-1' }

type Resp = { status?: number; corpo: unknown }

// fetch falso: responde na ordem e guarda as chamadas para conferir.
function fetchFalso(respostas: Resp[]) {
  const chamadas: { url: string; init: RequestInit }[] = []
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    chamadas.push({ url: String(url), init: init ?? {} })
    const r = respostas.shift()
    if (!r) throw new Error('chamada inesperada')
    return new Response(JSON.stringify(r.corpo), { status: r.status ?? 200 })
  })
  return { fn: fn as unknown as typeof fetch, chamadas }
}

const auth = { corpo: { apiKey: 'chave-1' } }

describe('cliente Pluggy', () => {
  it('autentica com clientId/clientSecret e usa a chave no X-API-KEY', async () => {
    const { fn, chamadas } = fetchFalso([auth, { corpo: { id: 'item-1', status: 'UPDATED' } }])
    const c = criarClientePluggy({ config, fetchFn: fn })
    const item = await c.buscarItem()

    expect(item.status).toBe('UPDATED')
    expect(chamadas[0].url).toBe('https://api.pluggy.ai/auth')
    expect(JSON.parse(String(chamadas[0].init.body))).toEqual({
      clientId: 'cid',
      clientSecret: 'csecret',
    })
    expect(chamadas[1].url).toBe('https://api.pluggy.ai/items/item-1')
    expect((chamadas[1].init.headers as Record<string, string>)['X-API-KEY']).toBe('chave-1')
  })

  it('reaproveita a chave entre chamadas e renova depois da validade', async () => {
    let agora = 0
    const { fn, chamadas } = fetchFalso([
      auth,
      { corpo: { id: 'item-1', status: 'UPDATED' } },
      { corpo: { id: 'item-1', status: 'UPDATED' } },
      { corpo: { apiKey: 'chave-2' } },
      { corpo: { id: 'item-1', status: 'UPDATED' } },
    ])
    const c = criarClientePluggy({ config, fetchFn: fn, agora: () => agora })
    await c.buscarItem()
    await c.buscarItem()
    expect(chamadas.filter((x) => x.url.endsWith('/auth'))).toHaveLength(1)

    agora = 3 * 60 * 60 * 1000
    await c.buscarItem()
    expect(chamadas.filter((x) => x.url.endsWith('/auth'))).toHaveLength(2)
    expect((chamadas[4].init.headers as Record<string, string>)['X-API-KEY']).toBe('chave-2')
  })

  it('renova a chave uma vez se o Pluggy responder 401', async () => {
    const { fn, chamadas } = fetchFalso([
      auth,
      { status: 401, corpo: { code: 401 } },
      { corpo: { apiKey: 'chave-2' } },
      { corpo: { id: 'item-1', status: 'UPDATED' } },
    ])
    const c = criarClientePluggy({ config, fetchFn: fn })
    expect((await c.buscarItem()).id).toBe('item-1')
    expect(chamadas).toHaveLength(4)
  })

  it('percorre todas as páginas de contas', async () => {
    const { fn, chamadas } = fetchFalso([
      auth,
      { corpo: { results: [{ id: 'a' }], totalPages: 2, page: 1 } },
      { corpo: { results: [{ id: 'b' }], totalPages: 2, page: 2 } },
    ])
    const contas = await criarClientePluggy({ config, fetchFn: fn }).listarContas()
    expect(contas.map((x) => x.id)).toEqual(['a', 'b'])
    expect(chamadas[1].url).toContain('/accounts?itemId=item-1&pageSize=500&page=1')
    expect(chamadas[2].url).toContain('page=2')
  })

  it('lista investimentos e faturas pelas rotas certas', async () => {
    const { fn, chamadas } = fetchFalso([
      auth,
      { corpo: { results: [{ id: 'i1' }], totalPages: 1 } },
      { corpo: { results: [{ id: 'f1' }], totalPages: 1 } },
    ])
    const c = criarClientePluggy({ config, fetchFn: fn })
    expect(await c.listarInvestimentos()).toEqual([{ id: 'i1' }])
    expect(await c.listarFaturas('conta-9')).toEqual([{ id: 'f1' }])
    expect(chamadas[1].url).toContain('/investments?itemId=item-1')
    expect(chamadas[2].url).toContain('/bills?accountId=conta-9')
  })

  it('lê transações por cursor (/v2/transactions) até acabar o next', async () => {
    const { fn, chamadas } = fetchFalso([
      auth,
      { corpo: { results: [{ id: 't1' }], next: '?after=abc' } },
      { corpo: { results: [{ id: 't2' }], next: null } },
    ])
    const c = criarClientePluggy({ config, fetchFn: fn })
    const t = await c.listarTransacoes('conta-1', { dateFrom: '2026-11-01' })
    expect(t.map((x) => x.id)).toEqual(['t1', 't2'])
    expect(chamadas[1].url).toBe(
      'https://api.pluggy.ai/v2/transactions?accountId=conta-1&dateFrom=2026-11-01',
    )
    expect(chamadas[2].url).toBe('https://api.pluggy.ai/v2/transactions?after=abc')
  })

  it('erro do Pluggy vira ErroPluggy sem vazar segredo', async () => {
    const { fn } = fetchFalso([
      { status: 401, corpo: { code: 401, codeDescription: 'CLIENT_KEYS_UNAUTHORIZED' } },
    ])
    const c = criarClientePluggy({ config, fetchFn: fn })
    const erro = await c.buscarItem().catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroPluggy)
    expect((erro as ErroPluggy).codigo).toBe('CLIENT_KEYS_UNAUTHORIZED')
    expect(String(erro)).not.toContain('csecret')
  })

  it('falha de rede vira ErroPluggy com status 0', async () => {
    const fn = vi.fn(async () => {
      throw new Error('boom com csecret')
    }) as unknown as typeof fetch
    const erro = await criarClientePluggy({ config, fetchFn: fn })
      .buscarItem()
      .catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroPluggy)
    expect((erro as ErroPluggy).status).toBe(0)
    expect(String(erro)).not.toContain('csecret')
  })
})

describe('tentar de novo em falhas passageiras', () => {
  const comEspera = () => {
    const esperas: number[] = []
    return { esperas, esperar: async (ms: number) => void esperas.push(ms) }
  }

  it('502 e depois sucesso: tenta de novo e devolve o resultado', async () => {
    const { esperas, esperar } = comEspera()
    const { fn, chamadas } = fetchFalso([
      { status: 502, corpo: {} },
      auth,
      { corpo: { id: 'item-1', status: 'UPDATED' } },
    ])
    const c = criarClientePluggy({ config, fetchFn: fn, esperar })
    expect((await c.buscarItem()).id).toBe('item-1')
    expect(chamadas.filter((x) => x.url.endsWith('/auth'))).toHaveLength(2)
    expect(esperas).toEqual([1000])
  })

  it('502, 503 e 504 seguidos: 3 tentativas, pausas de 1s e 3s e depois falha com o status', async () => {
    const { esperas, esperar } = comEspera()
    const { fn, chamadas } = fetchFalso([
      { status: 502, corpo: {} },
      { status: 503, corpo: {} },
      { status: 504, corpo: {} },
    ])
    const erro = await criarClientePluggy({ config, fetchFn: fn, esperar }).buscarItem().catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroPluggy)
    expect((erro as ErroPluggy).status).toBe(504)
    expect(chamadas).toHaveLength(3)
    expect(esperas).toEqual([1000, 3000])
  })

  it('erro de credencial (401) e de rede NÃO repetem', async () => {
    const a = comEspera()
    const r401 = fetchFalso([{ status: 401, corpo: { codeDescription: 'CLIENT_KEYS_UNAUTHORIZED' } }])
    await criarClientePluggy({ config, fetchFn: r401.fn, esperar: a.esperar }).buscarItem().catch(() => {})
    expect(r401.chamadas).toHaveLength(1)
    expect(a.esperas).toEqual([])

    const b = comEspera()
    const rede = vi.fn(async () => { throw new Error('x') }) as unknown as typeof fetch
    await criarClientePluggy({ config, fetchFn: rede, esperar: b.esperar }).buscarItem().catch(() => {})
    expect(rede).toHaveBeenCalledTimes(1)
    expect(b.esperas).toEqual([])
  })
})

describe('diasParaVencerAutorizacao', () => {
  const dia = 86_400_000
  const hoje = Date.parse('2026-11-28T00:00:00Z')

  it('conta os dias que faltam', () => {
    const item = { id: 'i', status: 'UPDATED', consentExpiresAt: new Date(hoje + 30 * dia).toISOString() }
    expect(diasParaVencerAutorizacao(item, hoje)).toBe(30)
  })

  it('dá negativo se já venceu e null se não há data', () => {
    const vencida = { id: 'i', status: 'LOGIN_ERROR', consentExpiresAt: new Date(hoje - 2 * dia).toISOString() }
    expect(diasParaVencerAutorizacao(vencida, hoje)).toBe(-2)
    expect(diasParaVencerAutorizacao({ id: 'i', status: 'UPDATED' }, hoje)).toBeNull()
  })
})
