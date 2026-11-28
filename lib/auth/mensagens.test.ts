import { describe, expect, it } from 'vitest'
import { traduzirErroLogin, traduzirErroMfa } from './mensagens'

describe('traduzirErroLogin', () => {
  it('credenciais erradas: mensagem única, sem revelar se o e-mail existe', () => {
    expect(traduzirErroLogin({ code: 'invalid_credentials', status: 400 })).toBe('E-mail ou senha incorretos.')
  })

  it('excesso de tentativas', () => {
    expect(traduzirErroLogin({ code: 'over_request_rate_limit' })).toMatch(/Muitas tentativas/)
    expect(traduzirErroLogin({ status: 429 })).toMatch(/Muitas tentativas/)
  })

  it('falha de rede', () => {
    expect(traduzirErroLogin({ message: 'Failed to fetch' })).toMatch(/Sem conexão/)
    expect(traduzirErroLogin({ message: 'Load failed' })).toMatch(/Sem conexão/)
    expect(traduzirErroLogin({ name: 'AuthRetryableFetchError', status: 0 })).toMatch(/Sem conexão/)
  })

  it('qualquer outro erro: mensagem genérica, sem detalhe técnico', () => {
    const msg = traduzirErroLogin({ code: 'unexpected_failure', message: 'boom interno' })
    expect(msg).toMatch(/Não foi possível entrar/)
    expect(msg).not.toMatch(/boom/)
    expect(traduzirErroLogin(null)).toMatch(/Não foi possível entrar/)
  })
})

describe('traduzirErroMfa', () => {
  it('código errado', () => {
    expect(traduzirErroMfa({ code: 'mfa_verification_failed' })).toMatch(/Código incorreto/)
  })

  it('excesso de tentativas e falta de internet', () => {
    expect(traduzirErroMfa({ status: 429 })).toMatch(/Muitas tentativas/)
    expect(traduzirErroMfa({ name: 'AuthRetryableFetchError', status: 0 })).toMatch(/Sem conexão/)
  })

  it('segundo fator desligado no projeto: diz onde ligar', () => {
    expect(traduzirErroMfa({ code: 'mfa_totp_enroll_not_enabled' })).toMatch(/Multi-Factor/)
  })

  it('erro desconhecido: mensagem genérica, sem detalhe técnico', () => {
    const msg = traduzirErroMfa({ code: 'xpto', message: 'detalhe interno' })
    expect(msg).toMatch(/Não foi possível verificar/)
    expect(msg).not.toMatch(/interno/)
  })
})
