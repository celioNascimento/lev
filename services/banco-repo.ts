import type { SupabaseClient } from '@supabase/supabase-js'

// Acesso ao banco (Supabase) para a sincronização. Só consultas; nenhuma regra de negócio.
// Usa o cliente de SERVIÇO (ignora RLS), por isso só roda no servidor.

export type Linha = Record<string, unknown>

export type DadosConexao = {
  pluggyItemId: string
  apelido: string
  status: string | null
  autorizacaoExpiraEm: string | null
}

export interface BancoRepo {
  obterCasaId(pluggyItemId: string): Promise<string>
  salvarConexao(casaId: string, dados: DadosConexao): Promise<{ id: string; leituraAnterior: string | null }>
  marcarLeitura(conexaoId: string, quando: string): Promise<void>
  salvarContas(linhas: Linha[]): Promise<Map<string, string>>
  salvarTransacoes(linhas: Linha[]): Promise<number>
  salvarFaturas(linhas: Linha[]): Promise<number>
  salvarInvestimentos(linhas: Linha[]): Promise<number>
}

const LOTE = 500

function falha(acao: string, erro: { message: string } | null): never {
  // Só a ação e a mensagem do banco; nunca dados da linha.
  throw new Error(`Falha ao ${acao}: ${erro?.message ?? 'erro desconhecido'}`)
}

export function criarBancoRepo(db: SupabaseClient): BancoRepo {
  async function upsertEmLotes(tabela: string, linhas: Linha[], conflito: string): Promise<number> {
    for (let i = 0; i < linhas.length; i += LOTE) {
      const { error } = await db.from(tabela).upsert(linhas.slice(i, i + LOTE), { onConflict: conflito })
      if (error) falha(`gravar ${tabela}`, error)
    }
    return linhas.length
  }

  return {
    async obterCasaId(pluggyItemId) {
      const existente = await db
        .from('conexoes_bancarias')
        .select('casa_id')
        .eq('pluggy_item_id', pluggyItemId)
        .maybeSingle()
      if (existente.error) falha('buscar a conexão', existente.error)
      if (existente.data) return existente.data.casa_id as string

      const casas = await db.from('casas').select('id').limit(2)
      if (casas.error) falha('buscar a casa', casas.error)
      if (!casas.data || casas.data.length !== 1) {
        throw new Error('Esperava exatamente uma casa para ligar a conexão; há 0 ou mais de 1.')
      }
      return casas.data[0].id as string
    },

    async salvarConexao(casaId, d) {
      const antes = await db
        .from('conexoes_bancarias')
        .select('ultima_leitura_em')
        .eq('pluggy_item_id', d.pluggyItemId)
        .maybeSingle()
      if (antes.error) falha('ler a conexão', antes.error)

      const { data, error } = await db
        .from('conexoes_bancarias')
        .upsert(
          {
            casa_id: casaId,
            pluggy_item_id: d.pluggyItemId,
            apelido: d.apelido,
            status: d.status,
            autorizacao_expira_em: d.autorizacaoExpiraEm,
          },
          { onConflict: 'pluggy_item_id' },
        )
        .select('id')
        .single()
      if (error || !data) falha('gravar a conexão', error)
      return { id: data.id as string, leituraAnterior: (antes.data?.ultima_leitura_em as string | null) ?? null }
    },

    async marcarLeitura(conexaoId, quando) {
      const { error } = await db.from('conexoes_bancarias').update({ ultima_leitura_em: quando }).eq('id', conexaoId)
      if (error) falha('marcar a leitura', error)
    },

    async salvarContas(linhas) {
      const mapa = new Map<string, string>()
      for (let i = 0; i < linhas.length; i += LOTE) {
        const { data, error } = await db
          .from('contas_bancarias')
          .upsert(linhas.slice(i, i + LOTE), { onConflict: 'conexao_id,pluggy_id' })
          .select('id, pluggy_id')
        if (error) falha('gravar contas_bancarias', error)
        for (const r of data ?? []) mapa.set(r.pluggy_id as string, r.id as string)
      }
      return mapa
    },

    salvarTransacoes: (l) => upsertEmLotes('transacoes_bancarias', l, 'conta_id,pluggy_id'),
    salvarFaturas: (l) => upsertEmLotes('faturas_cartao', l, 'conta_id,pluggy_id'),
    salvarInvestimentos: (l) => upsertEmLotes('investimentos', l, 'conexao_id,pluggy_id'),
  }
}
