import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { lerConfigSupabase } from '@/lib/env'
import type { EstadoDeAcesso } from '@/lib/auth/rotas'

// Renova a sessão (cookies) a cada pedido e diz em que estágio do login a pessoa está.
// getUser() confere o login com o servidor do Supabase; não confia só no cookie.
// O nível (aal1/aal2) vem das claims do token, verificadas por getClaims().
export async function atualizarSessao(request: NextRequest) {
  const { url, chavePublica } = lerConfigSupabase()
  let resposta = NextResponse.next({ request })

  const supabase = createServerClient(url, chavePublica, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) request.cookies.set(name, value)
        resposta = NextResponse.next({ request })
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options)
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  const usuario = data.user

  let nivel: EstadoDeAcesso['nivel'] = null
  if (usuario) {
    const { data: claims } = await supabase.auth.getClaims()
    const aal = claims?.claims?.aal
    nivel = aal === 'aal2' ? 'aal2' : 'aal1'
  }

  const temAparelho = Boolean(
    usuario?.factors?.some((f) => f.factor_type === 'totp' && f.status === 'verified'),
  )
  const estado: EstadoDeAcesso = { logado: Boolean(usuario), nivel, temAparelho }
  return { resposta, estado }
}
