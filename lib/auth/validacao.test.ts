import { describe, expect, it } from 'vitest'
import { validarCredenciais } from './validacao'

describe('validarCredenciais', () => {
  it('aceita e-mail e senha preenchidos', () => {
    expect(validarCredenciais('a@b.com', 'qualquer')).toBeNull()
  })

  it('ignora espaços em volta do e-mail', () => {
    expect(validarCredenciais('  a@b.com  ', 'x')).toBeNull()
  })

  it('pede o e-mail quando está vazio', () => {
    expect(validarCredenciais('   ', 'x')).toBe('Digite seu e-mail.')
  })

  it('avisa quando o e-mail não tem formato de e-mail', () => {
    expect(validarCredenciais('sem-arroba', 'x')).toMatch(/não parece correto/)
    expect(validarCredenciais('a@b', 'x')).toMatch(/não parece correto/)
  })

  it('pede a senha quando está vazia', () => {
    expect(validarCredenciais('a@b.com', '')).toBe('Digite sua senha.')
  })
})
