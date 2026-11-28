import type { ConfigPluggy } from '@/lib/pluggy-config'
import { diasParaVencerAutorizacao, type ClientePluggy } from './pluggy/cliente'
import { mapearConta, mapearFatura, mapearInvestimento, mapearTransacao } from './pluggy/mapeadores'
import type { BancoRepo } from './banco-repo'

// Lê o Pluggy e grava no Supabase. Só faz upsert: nunca apaga nada.
// Resultado traz apenas contagens e avisos, nunca valores ou dados de contas.

export type ResultadoSync =
  | { ok: true; contas: number; transacoes: number; faturas: number; investimentos: number; diasParaVencer: number | null }
  | { ok: false; motivo: 'autorizacao_vencida'; status: string }

const DIA_MS = 86_400_000
const JANELA_PRIMEIRA_LEITURA_DIAS = 90
// Nas leituras seguintes, relê alguns dias para pegar lançamentos que mudam de pendente para efetivado.
const JANELA_REPASSE_DIAS = 15

type Dependencias = {
  cliente: ClientePluggy
  repo: BancoRepo
  config: ConfigPluggy
  agora?: () => number
}

export async function sincronizar({ cliente, repo, config, agora = Date.now }: Dependencias): Promise<ResultadoSync> {
  const inicio = agora()
  const stamp = new Date(inicio).toISOString()

  const item = await cliente.buscarItem()
  const dias = diasParaVencerAutorizacao(item, inicio)
  const casaId = await repo.obterCasaId(config.itemId)
  const conexao = await repo.salvarConexao(casaId, {
    pluggyItemId: config.itemId,
    apelido: 'Meu Pluggy',
    status: item.status,
    autorizacaoExpiraEm: item.consentExpiresAt ?? null,
  })

  // Autorização vencida: o Pluggy devolve listas vazias. Avisa em vez de "sincronizar nada".
  if (dias !== null && dias < 0) {
    return { ok: false, motivo: 'autorizacao_vencida', status: item.status }
  }

  const janelaDias = conexao.leituraAnterior ? JANELA_REPASSE_DIAS : JANELA_PRIMEIRA_LEITURA_DIAS
  const dateFrom = new Date(inicio - janelaDias * DIA_MS).toISOString().slice(0, 10)

  const contas = await cliente.listarContas()
  const ids = await repo.salvarContas(contas.map((c) => mapearConta(c, casaId, conexao.id, stamp)))

  let transacoes = 0
  let faturas = 0
  for (const conta of contas) {
    const contaId = ids.get(conta.id)
    if (!contaId) continue
    const txs = await cliente.listarTransacoes(conta.id, { dateFrom })
    transacoes += await repo.salvarTransacoes(txs.map((t) => mapearTransacao(t, casaId, contaId, stamp)))
    if (conta.type === 'CREDIT') {
      const fs = await cliente.listarFaturas(conta.id)
      faturas += await repo.salvarFaturas(fs.map((f) => mapearFatura(f, casaId, contaId, stamp)))
    }
  }

  const invs = await cliente.listarInvestimentos()
  const investimentos = await repo.salvarInvestimentos(
    invs.map((i) => mapearInvestimento(i, casaId, conexao.id, stamp)),
  )

  await repo.marcarLeitura(conexao.id, stamp)
  return { ok: true, contas: contas.length, transacoes, faturas, investimentos, diasParaVencer: dias }
}
