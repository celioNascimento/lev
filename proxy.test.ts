import { NextRequest, NextResponse } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

const atualizarSessao = vi.fn()
vi.mock('@/lib/supabase/proxy', () => ({ atualizarSessao: (...a: unknown[]) => atualizarSessao(...a) }))

import { proxy } from './proxy'

describe('proxy', () => {
  it('deixa a rota do cron passar sem olhar a sessão (ela se protege com CRON_SECRET)', async () => {
    const r = await proxy(new NextRequest('http://localhost/api/cron/sincronizar'))
    expect(r.status).toBe(200)
    expect(r.headers.get('location')).toBeNull()
    expect(atualizarSessao).not.toHaveBeenCalled()
  })

  it('sem login, uma tela comum continua indo para /entrar', async () => {
    atualizarSessao.mockResolvedValueOnce({
      resposta: NextResponse.next(),
      estado: { logado: false, nivel: null, temAparelho: false },
    })
    const r = await proxy(new NextRequest('http://localhost/'))
    expect(r.status).toBe(307)
    expect(new URL(r.headers.get('location') ?? '').pathname).toBe('/entrar')
  })

  it('sem login, outra rota de API também continua barrada', async () => {
    atualizarSessao.mockResolvedValueOnce({
      resposta: NextResponse.next(),
      estado: { logado: false, nivel: null, temAparelho: false },
    })
    const r = await proxy(new NextRequest('http://localhost/api/outra'))
    expect(r.status).toBe(307)
  })
})
