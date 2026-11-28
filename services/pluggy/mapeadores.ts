import type {
  ContaPluggy,
  FaturaPluggy,
  InvestimentoPluggy,
  TransacaoPluggy,
} from './tipos'

// Converte o formato do Pluggy para as colunas das tabelas do Lev. Funções puras, sem rede.

const soData = (v?: string | null) => (v ? v.slice(0, 10) : null)

export function mapearConta(c: ContaPluggy, casaId: string, conexaoId: string, agora: string) {
  const digitos = (c.number ?? '').replace(/\D/g, '')
  return {
    casa_id: casaId,
    conexao_id: conexaoId,
    pluggy_id: c.id,
    tipo: c.type,
    subtipo: c.subtype ?? null,
    nome: c.marketingName || c.name,
    final_numero: digitos ? digitos.slice(-4) : null,
    saldo: c.balance ?? 0,
    moeda: c.currencyCode || 'BRL',
    limite_credito: c.creditData?.creditLimit ?? null,
    limite_disponivel: c.creditData?.availableCreditLimit ?? null,
    fechamento_fatura: soData(c.creditData?.balanceCloseDate),
    vencimento_fatura: soData(c.creditData?.balanceDueDate),
    atualizada_em: agora,
  }
}

export function mapearTransacao(t: TransacaoPluggy, casaId: string, contaId: string, agora: string) {
  return {
    casa_id: casaId,
    conta_id: contaId,
    pluggy_id: t.id,
    descricao: t.description || t.descriptionRaw || '(sem descrição)',
    valor: t.amount,
    tipo: t.type,
    data: t.date,
    categoria: t.category ?? null,
    status: t.status ?? null,
    atualizada_em: agora,
  }
}

export function mapearFatura(f: FaturaPluggy, casaId: string, contaId: string, agora: string) {
  return {
    casa_id: casaId,
    conta_id: contaId,
    pluggy_id: f.id,
    vencimento: f.dueDate.slice(0, 10),
    fechamento: soData(f.billClosingDate),
    valor_total: f.totalAmount,
    pagamento_minimo: f.minimumPaymentAmount ?? null,
    moeda: f.totalAmountCurrencyCode || 'BRL',
    atualizada_em: agora,
  }
}

export function mapearInvestimento(
  i: InvestimentoPluggy,
  casaId: string,
  conexaoId: string,
  agora: string,
) {
  return {
    casa_id: casaId,
    conexao_id: conexaoId,
    pluggy_id: i.id,
    nome: i.name,
    tipo: i.type,
    subtipo: i.subtype ?? null,
    saldo: i.balance ?? 0,
    valor_aplicado: i.amountOriginal ?? null,
    lucro: i.amountProfit ?? null,
    emissor: i.issuer ?? null,
    data_referencia: i.date ?? null,
    moeda: i.currencyCode || 'BRL',
    atualizado_em: agora,
  }
}
