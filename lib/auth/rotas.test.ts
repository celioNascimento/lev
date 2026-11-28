import { describe, expect, it } from 'vitest'
import { decidirRota, type EstadoDeAcesso } from './rotas'

const semLogin: EstadoDeAcesso = { logado: false, nivel: null, temAparelho: false }
const soSenhaSemAparelho: EstadoDeAcesso = { logado: true, nivel: 'aal1', temAparelho: false }
const soSenhaComAparelho: EstadoDeAcesso = { logado: true, nivel: 'aal1', temAparelho: true }
const completo: EstadoDeAcesso = { logado: true, nivel: 'aal2', temAparelho: true }

describe('decidirRota', () => {
  it('sem login, tudo manda para /entrar, menos /entrar', () => {
    expect(decidirRota('/', semLogin)).toEqual({ tipo: 'redirecionar', para: '/entrar' })
    expect(decidirRota('/verificar', semLogin)).toEqual({ tipo: 'redirecionar', para: '/entrar' })
    expect(decidirRota('/seguranca/configurar', semLogin)).toEqual({ tipo: 'redirecionar', para: '/entrar' })
    expect(decidirRota('/entrar', semLogin)).toEqual({ tipo: 'seguir' })
  })

  it('senha ok mas sem aparelho: só a tela de cadastrar o aparelho', () => {
    expect(decidirRota('/', soSenhaSemAparelho)).toEqual({ tipo: 'redirecionar', para: '/seguranca/configurar' })
    expect(decidirRota('/entrar', soSenhaSemAparelho)).toEqual({ tipo: 'redirecionar', para: '/seguranca/configurar' })
    expect(decidirRota('/verificar', soSenhaSemAparelho)).toEqual({ tipo: 'redirecionar', para: '/seguranca/configurar' })
    expect(decidirRota('/seguranca/configurar', soSenhaSemAparelho)).toEqual({ tipo: 'seguir' })
  })

  it('senha ok com aparelho, sem código: só a tela do código', () => {
    expect(decidirRota('/', soSenhaComAparelho)).toEqual({ tipo: 'redirecionar', para: '/verificar' })
    expect(decidirRota('/seguranca/configurar', soSenhaComAparelho)).toEqual({ tipo: 'redirecionar', para: '/verificar' })
    expect(decidirRota('/verificar', soSenhaComAparelho)).toEqual({ tipo: 'seguir' })
  })

  it('senha e código: abre tudo, menos as telas de passagem', () => {
    expect(decidirRota('/', completo)).toEqual({ tipo: 'seguir' })
    expect(decidirRota('/seguranca/configurar', completo)).toEqual({ tipo: 'seguir' })
    expect(decidirRota('/entrar', completo)).toEqual({ tipo: 'redirecionar', para: '/' })
    expect(decidirRota('/verificar', completo)).toEqual({ tipo: 'redirecionar', para: '/' })
  })
})
