import { describe, expect, it } from 'vitest'
import { traduzirErroLogin } from './mensagens'

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
