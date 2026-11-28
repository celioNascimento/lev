import { describe, expect, it, vi } from 'vitest'
import type { BancoRepo, Linha } from './banco-repo'
import type { ClientePluggy } from './pluggy/cliente'
import { sincronizar } from './sincronizacao'

const config = { clientId: 'c', clientSecret: 's', itemId: 'item-1' }
const AGORA = Date.parse('2026-11-28T09:00:00Z')
const DIA = 86_400_000

function montar(opts: { consentExpiresAt?: string | null; leituraAnterior?: string | null } = {}) {
  const gravado = { contas: [] as Linha[], transacoes: [] as Linha[], faturas: [] as Linha[], investimentos: [] as Linha[] }
  const repo: BancoRepo = {
    obterCasaId: vi.fn(async () => 'casa-1'),
    salvarConexao: vi.fn(async () => ({ id: 'conx-1', leituraAnterior: opts.leituraAnterior ?? null })),
    marcarLeitura: vi.fn(async () => {}),
    salvarContas: vi.fn(async (l: Linha[]) => {
      gravado.contas.push(...l)
      return new Map(l.map((x) => [x.pluggy_id as string, `uuid-${x.pluggy_id}`]))
    }),
    salvarTransacoes: vi.fn(async (l: Linha[]) => (gravado.transacoes.push(...l), l.length)),
    salvarFaturas: vi.fn(async (l: Linha[]) => (gravado.faturas.push(...l), l.length)),
    salvarInvestimentos: vi.fn(async (l: Linha[]) => (gravado.investimentos.push(...l), l.length)),
  }
  const cliente = {
    buscarItem: vi.fn(async () => ({ id: 'item-1', status: 'UPDATED', consentExpiresAt: opts.consentExpiresAt ?? new Date(AGORA + 200 * DIA).toISOString() })),
    listarContas: vi.fn(async () => [
      { id: 'b1', type: 'BANK', subtype: 'CHECKING_ACCOUNT', name: 'CC', number: '1234', balance: 10, currencyCode: 'BRL', itemId: 'item-1' },
      { id: 'k1', type: 'CREDIT', subtype: 'CREDIT_CARD', name: 'Cartão', number: '9999', balance: 5, currencyCode: 'BRL', itemId: 'item-1' },
    ]),
    listarTransacoes: vi.fn(async (contaId: string) => [{ id: `t-${contaId}`, description: 'x', amount: 1, date: '2026-11-27T00:00:00Z', type: 'DEBIT', accountId: contaId }]),
    listarFaturas: vi.fn(async () => [{ id: 'f1', dueDate: '2026-12-10T00:00:00Z', totalAmount: 50, totalAmountCurrencyCode: 'BRL' }]),
    listarInvestimentos: vi.fn(async () => [{ id: 'inv1', name: 'CDB', type: 'FIXED_INCOME', balance: 100, itemId: 'item-1' }]),
  } as unknown as ClientePluggy
  return { repo, cliente, gravado }
}

describe('sincronizar', () => {
  it('grava contas, transações, faturas (só de cartão) e investimentos e marca a leitura', async () => {
    const { repo, cliente, gravado } = montar()
    const r = await sincronizar({ cliente, repo, config, agora: () => AGORA })

    expect(r).toEqual({ ok: true, contas: 2, transacoes: 2, faturas: 1, investimentos: 1, diasParaVencer: 200 })
    expect(cliente.listarFaturas).toHaveBeenCalledTimes(1)
    expect(cliente.listarFaturas).toHaveBeenCalledWith('k1')
    expect(gravado.transacoes.map((t) => t.conta_id)).toEqual(['uuid-b1', 'uuid-k1'])
    expect(gravado.faturas[0]).toMatchObject({ conta_id: 'uuid-k1', casa_id: 'casa-1' })
    expect(repo.marcarLeitura).toHaveBeenCalledWith('conx-1', new Date(AGORA).toISOString())
  })

  it('primeira leitura pega 90 dias; as seguintes, 15', async () => {
    const a = montar()
    await sincronizar({ cliente: a.cliente, repo: a.repo, config, agora: () => AGORA })
    expect(a.cliente.listarTransacoes).toHaveBeenCalledWith('b1', { dateFrom: '2026-08-30' })

    const b = montar({ leituraAnterior: '2026-11-27T09:00:00Z' })
    await sincronizar({ cliente: b.cliente, repo: b.repo, config, agora: () => AGORA })
    expect(b.cliente.listarTransacoes).toHaveBeenCalledWith('b1', { dateFrom: '2026-11-13' })
  })

  it('autorização vencida: avisa, registra o status e não lê nem grava dados', async () => {
    const { repo, cliente } = montar({ consentExpiresAt: new Date(AGORA - DIA).toISOString() })
    const r = await sincronizar({ cliente, repo, config, agora: () => AGORA })

    expect(r).toEqual({ ok: false, motivo: 'autorizacao_vencida', status: 'UPDATED' })
    expect(repo.salvarConexao).toHaveBeenCalled()
    expect(cliente.listarContas).not.toHaveBeenCalled()
    expect(repo.salvarContas).not.toHaveBeenCalled()
    expect(repo.marcarLeitura).not.toHaveBeenCalled()
  })

  it('erro do Pluggy no meio interrompe sem marcar a leitura', async () => {
    const { repo, cliente } = montar()
    ;(cliente.listarInvestimentos as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('falhou'))
    await expect(sincronizar({ cliente, repo, config, agora: () => AGORA })).rejects.toThrow('falhou')
    expect(repo.marcarLeitura).not.toHaveBeenCalled()
  })
})
