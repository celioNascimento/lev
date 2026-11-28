import { describe, expect, it } from 'vitest'
import { normalizarCodigo, validarCodigo } from './codigo'

describe('normalizarCodigo', () => {
  it('remove espaços, traços e letras', () => {
    expect(normalizarCodigo('123 456')).toBe('123456')
    expect(normalizarCodigo('12-34-56')).toBe('123456')
    expect(normalizarCodigo('ab1c2')).toBe('12')
  })

  it('limita a 6 dígitos', () => {
    expect(normalizarCodigo('1234567890')).toBe('123456')
  })
})

describe('validarCodigo', () => {
  it('aceita 6 dígitos, mesmo com espaço no meio', () => {
    expect(validarCodigo('123456')).toBeNull()
    expect(validarCodigo('123 456')).toBeNull()
  })

  it('pede o código quando está vazio', () => {
    expect(validarCodigo('  ')).toMatch(/Digite o código/)
  })

  it('avisa quando faltam dígitos', () => {
    expect(validarCodigo('123')).toMatch(/6 dígitos/)
  })
})
