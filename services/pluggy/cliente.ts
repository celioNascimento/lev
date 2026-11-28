import type { ConfigPluggy } from '@/lib/pluggy-config'
import type {
  ContaPluggy,
  FaturaPluggy,
  FiltroTransacoes,
  InvestimentoPluggy,
  ItemPluggy,
  TransacaoPluggy,
} from './tipos'

// Cliente da API do Pluggy. Só roda no servidor.
// Não grava nada: apenas lê. A gravação no Supabase fica em outro service.

const URL_BASE = 'https://api.pluggy.ai'
const TEMPO_LIMITE_MS = 15_000
// A chave do Pluggy dura 2h; renovamos antes disso.
const VALIDADE_CHAVE_MS = 100 * 60 * 1000
const MAX_PAGINAS = 100

export class ErroPluggy extends Error {
  constructor(
    mensagem: string,
    readonly status: number,
    readonly codigo?: string,
  ) {
    super(mensagem)
    this.name = 'ErroPluggy'
  }
}

type Pagina<T> = { results: T[]; totalPages?: number; page?: number }
type PaginaCursor<T> = { results: T[]; next?: string | null }

export type OpcoesCliente = {
  config: ConfigPluggy
  fetchFn?: typeof fetch
  agora?: () => number
}

export function criarClientePluggy({ config, fetchFn = fetch, agora = Date.now }: OpcoesCliente) {
  let chave: { valor: string; expiraEm: number } | null = null

  async function chamar(caminho: string, init: RequestInit): Promise<unknown> {
    let resposta: Response
    try {
      resposta = await fetchFn(`${URL_BASE}${caminho}`, {
        ...init,
        signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
        cache: 'no-store',
      })
    } catch {
      // Não repassamos o erro original para não vazar cabeçalhos ou URLs.
      throw new ErroPluggy('Não foi possível falar com o Pluggy (rede ou tempo esgotado).', 0)
    }
    if (!resposta.ok) {
      let codigo: string | undefined
      try {
        const corpo = (await resposta.json()) as { code?: string; codeDescription?: string }
        codigo = corpo.codeDescription ?? corpo.code
      } catch {
        // corpo sem JSON: segue só com o status
      }
      throw new ErroPluggy(
        `O Pluggy respondeu com erro ${resposta.status}${codigo ? ` (${codigo})` : ''}.`,
        resposta.status,
        codigo,
      )
    }
    return resposta.json()
  }

  async function autenticar(): Promise<string> {
    const corpo = (await chamar('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: config.clientId, clientSecret: config.clientSecret }),
    })) as { apiKey?: string }
    if (!corpo.apiKey) throw new ErroPluggy('O Pluggy não devolveu a chave de acesso.', 200)
    chave = { valor: corpo.apiKey, expiraEm: agora() + VALIDADE_CHAVE_MS }
    return chave.valor
  }

  async function obterChave(): Promise<string> {
    if (chave && agora() < chave.expiraEm) return chave.valor
    return autenticar()
  }

  async function get<T>(caminho: string): Promise<T> {
    const tentar = async () =>
      chamar(caminho, { method: 'GET', headers: { 'X-API-KEY': await obterChave() } }) as Promise<T>
    try {
      return await tentar()
    } catch (e) {
      // Chave recusada: renova uma vez e tenta de novo.
      if (e instanceof ErroPluggy && e.status === 401 && chave) {
        chave = null
        return tentar()
      }
      throw e
    }
  }

  async function todasAsPaginas<T>(caminhoBase: string): Promise<T[]> {
    const itens: T[] = []
    const sep = caminhoBase.includes('?') ? '&' : '?'
    for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
      const r = await get<Pagina<T>>(`${caminhoBase}${sep}pageSize=500&page=${pagina}`)
      itens.push(...r.results)
      if (pagina >= (r.totalPages ?? 1)) return itens
    }
    throw new ErroPluggy('Páginas demais ao ler o Pluggy; interrompi por segurança.', 0)
  }

  const q = encodeURIComponent

  return {
    buscarItem: () => get<ItemPluggy>(`/items/${q(config.itemId)}`),

    listarContas: () => todasAsPaginas<ContaPluggy>(`/accounts?itemId=${q(config.itemId)}`),

    listarInvestimentos: () =>
      todasAsPaginas<InvestimentoPluggy>(`/investments?itemId=${q(config.itemId)}`),

    listarFaturas: (contaId: string) =>
      todasAsPaginas<FaturaPluggy>(`/bills?accountId=${q(contaId)}`),

    // /transactions está marcado como obsoleto pelo Pluggy; usamos /v2/transactions (cursor).
    async listarTransacoes(contaId: string, filtro: FiltroTransacoes = {}): Promise<TransacaoPluggy[]> {
      const params = new URLSearchParams({ accountId: contaId })
      if (filtro.dateFrom) params.set('dateFrom', filtro.dateFrom)
      if (filtro.dateTo) params.set('dateTo', filtro.dateTo)
      if (filtro.createdAtFrom) params.set('createdAtFrom', filtro.createdAtFrom)

      const itens: TransacaoPluggy[] = []
      let caminho = `/v2/transactions?${params.toString()}`
      for (let i = 0; i < MAX_PAGINAS; i++) {
        const r = await get<PaginaCursor<TransacaoPluggy>>(caminho)
        itens.push(...r.results)
        if (!r.next) return itens
        // O cursor vem pronto do Pluggy: é só anexar ao caminho, sem montar por conta própria.
        caminho = `/v2/transactions${r.next}`
      }
      throw new ErroPluggy('Páginas demais ao ler o Pluggy; interrompi por segurança.', 0)
    },
  }
}

export type ClientePluggy = ReturnType<typeof criarClientePluggy>

// A autorização do Meu Pluggy vale 1 ano. Devolve quantos dias faltam (negativo = vencida)
// ou null se o Pluggy não informou a data.
export function diasParaVencerAutorizacao(item: ItemPluggy, agora = Date.now()): number | null {
  if (!item.consentExpiresAt) return null
  const fim = Date.parse(item.consentExpiresAt)
  if (Number.isNaN(fim)) return null
  return Math.floor((fim - agora) / 86_400_000)
}
