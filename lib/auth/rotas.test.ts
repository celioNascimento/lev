import { describe, expect, it } from 'vitest'
import { decidirRota } from './rotas'

describe('decidirRota', () => {
  it('sem login, qualquer tela (exceto /entrar) manda para /entrar', () => {
    expect(decidirRota('/', false)).toEqual({ tipo: 'redirecionar', para: '/entrar' })
    expect(decidirRota('/contas', false)).toEqual({ tipo: 'redirecionar', para: '/entrar' })
    expect(decidirRota('/entrar/', false)).toEqual({ tipo: 'redirecionar', para: '/entrar' })
  })

  it('sem login, /entrar abre normalmente', () => {
    expect(decidirRota('/entrar', false)).toEqual({ tipo: 'seguir' })
  })

  it('com login, /entrar manda para a tela inicial', () => {
    expect(decidirRota('/entrar', true)).toEqual({ tipo: 'redirecionar', para: '/' })
  })

  it('com login, as demais telas abrem normalmente', () => {
    expect(decidirRota('/', true)).toEqual({ tipo: 'seguir' })
    expect(decidirRota('/contas', true)).toEqual({ tipo: 'seguir' })
  })
})
