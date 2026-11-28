import { beforeEach, describe, expect, it, vi } from 'vitest'

const mfa = {
  listFactors: vi.fn(),
  unenroll: vi.fn(),
  enroll: vi.fn(),
  challengeAndVerify: vi.fn(),
}
vi.mock('@/lib/supabase/client', () => ({ criarClienteNavegador: () => ({ auth: { mfa } }) }))

import { confirmarAparelho, iniciarCadastroDeAparelho, verificarCodigoDeEntrada } from './segundoFator'

beforeEach(() => Object.values(mfa).forEach((f) => f.mockReset()))

describe('iniciarCadastroDeAparelho', () => {
  it('apaga tentativas não confirmadas e nomeia o aparelho pelo total já confirmado', async () => {
    mfa.listFactors.mockResolvedValue({
      data: {
        totp: [{ id: 'a' }],
        all: [
          { id: 'a', factor_type: 'totp', status: 'verified' },
          { id: 'velho', factor_type: 'totp', status: 'unverified' },
        ],
      },
      error: null,
    })
    mfa.enroll.mockResolvedValue({
      data: { id: 'novo', totp: { qr_code: '<svg/>', secret: 'ABC' } },
      error: null,
    })
    const r = await iniciarCadastroDeAparelho()
    expect(mfa.unenroll).toHaveBeenCalledTimes(1)
    expect(mfa.unenroll).toHaveBeenCalledWith({ factorId: 'velho' })
    expect(mfa.enroll).toHaveBeenCalledWith({ factorType: 'totp', friendlyName: 'Aparelho 2' })
    expect(r).toEqual({
      ok: true,
      fatorId: 'novo',
      qrCode: 'data:image/svg+xml;utf-8,<svg/>',
      segredo: 'ABC',
      nomeDoAparelho: 'Aparelho 2',
    })
  })

  it('traduz o erro quando o segundo fator está desligado no projeto', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [], all: [] }, error: null })
    mfa.enroll.mockResolvedValue({ data: null, error: { code: 'mfa_totp_enroll_not_enabled' } })
    const r = await iniciarCadastroDeAparelho()
    expect(r.ok).toBe(false)
    expect(!r.ok && r.erro).toMatch(/Multi-Factor/)
  })
})

describe('confirmarAparelho', () => {
  it('manda só os dígitos do código', async () => {
    mfa.challengeAndVerify.mockResolvedValue({ data: {}, error: null })
    const r = await confirmarAparelho('f1', '123 456')
    expect(mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'f1', code: '123456' })
    expect(r).toEqual({ erro: null })
  })

  it('código errado vira frase simples', async () => {
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { code: 'mfa_verification_failed' } })
    expect((await confirmarAparelho('f1', '000000')).erro).toMatch(/Código incorreto/)
  })
})

describe('verificarCodigoDeEntrada', () => {
  it('tenta o segundo aparelho quando o primeiro recusa o código', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [{ id: 'a' }, { id: 'b' }] }, error: null })
    mfa.challengeAndVerify
      .mockResolvedValueOnce({ data: null, error: { code: 'mfa_verification_failed' } })
      .mockResolvedValueOnce({ data: {}, error: null })
    const r = await verificarCodigoDeEntrada('654321')
    expect(r).toEqual({ erro: null })
    expect(mfa.challengeAndVerify).toHaveBeenCalledTimes(2)
  })

  it('se nenhum aparelho aceitar, mostra "código incorreto"', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [{ id: 'a' }, { id: 'b' }] }, error: null })
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { code: 'mfa_verification_failed' } })
    expect((await verificarCodigoDeEntrada('111111')).erro).toMatch(/Código incorreto/)
  })

  it('não insiste no outro aparelho se o erro não for de código errado', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [{ id: 'a' }, { id: 'b' }] }, error: null })
    mfa.challengeAndVerify.mockResolvedValue({ data: null, error: { status: 429 } })
    const r = await verificarCodigoDeEntrada('111111')
    expect(mfa.challengeAndVerify).toHaveBeenCalledTimes(1)
    expect(r.erro).toMatch(/Muitas tentativas/)
  })

  it('sem aparelho cadastrado, pede para entrar de novo', async () => {
    mfa.listFactors.mockResolvedValue({ data: { totp: [] }, error: null })
    expect((await verificarCodigoDeEntrada('111111')).erro).toMatch(/Nenhum aparelho/)
  })
})
