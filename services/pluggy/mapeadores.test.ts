import { describe, expect, it } from 'vitest'
import { mapearConta, mapearFatura, mapearInvestimento, mapearTransacao } from './mapeadores'

const AGORA = '2026-11-28T09:00:00.000Z'

describe('mapeadores', () => {
  it('conta: guarda só os 4 últimos dígitos e as datas sem hora', () => {
    const l = mapearConta(
      {
        id: 'c1', type: 'CREDIT', subtype: 'CREDIT_CARD', name: 'Cartão', marketingName: 'Gold',
        number: '5555-1234-9876', balance: 10.5, currencyCode: 'BRL', itemId: 'i',
        creditData: { creditLimit: 1000, availableCreditLimit: 400, balanceCloseDate: '2026-12-05T00:00:00Z', balanceDueDate: '2026-12-12T00:00:00Z' },
      },
      'casa', 'conx', AGORA,
    )
    expect(l.final_numero).toBe('9876')
    expect(l.nome).toBe('Gold')
    expect(l.fechamento_fatura).toBe('2026-12-05')
    expect(l.vencimento_fatura).toBe('2026-12-12')
    expect(JSON.stringify(l)).not.toContain('5555-1234')
  })

  it('conta sem número nem creditData não quebra', () => {
    const l = mapearConta({ id: 'c', type: 'BANK', subtype: 'CHECKING_ACCOUNT', name: 'CC', number: '', balance: 0, currencyCode: '', itemId: 'i' }, 'casa', 'conx', AGORA)
    expect(l.final_numero).toBeNull()
    expect(l.moeda).toBe('BRL')
    expect(l.limite_credito).toBeNull()
  })

  it('transação: mantém valor e tipo do Pluggy e usa descrição alternativa', () => {
    const l = mapearTransacao({ id: 't', description: '', descriptionRaw: 'PIX X', amount: -25.9, date: '2026-11-27T12:00:00Z', type: 'DEBIT', accountId: 'a' }, 'casa', 'conta', AGORA)
    expect(l).toMatchObject({ pluggy_id: 't', descricao: 'PIX X', valor: -25.9, tipo: 'DEBIT', conta_id: 'conta' })
  })

  it('fatura e investimento mapeiam os campos esperados', () => {
    const f = mapearFatura({ id: 'f', dueDate: '2026-12-10T00:00:00Z', totalAmount: 300, totalAmountCurrencyCode: 'BRL' }, 'casa', 'conta', AGORA)
    expect(f).toMatchObject({ vencimento: '2026-12-10', valor_total: 300, fechamento: null })
    const i = mapearInvestimento({ id: 'i', name: 'CDB', type: 'FIXED_INCOME', balance: 100, amountOriginal: 90, amountProfit: 10, itemId: 'x' }, 'casa', 'conx', AGORA)
    expect(i).toMatchObject({ saldo: 100, valor_aplicado: 90, lucro: 10, conexao_id: 'conx' })
  })
})
