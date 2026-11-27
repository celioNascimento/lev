import { NextResponse, type NextRequest } from 'next/server'
import { decidirRota } from '@/lib/auth/rotas'
import { atualizarSessao } from '@/lib/supabase/proxy'

// Primeira barreira: sem login, só a tela /entrar abre. A segunda barreira é a checagem
// no servidor dentro da própria tela (components/AreaProtegida) e a última é o RLS no banco.
export async function proxy(request: NextRequest) {
  const { resposta, usuario } = await atualizarSessao(request)
  const decisao = decidirRota(request.nextUrl.pathname, Boolean(usuario))
  if (decisao.tipo === 'seguir') return resposta

  const destino = request.nextUrl.clone()
  destino.pathname = decisao.para
  destino.search = ''
  const redirecionamento = NextResponse.redirect(destino)
  // Mantém os cookies renovados da sessão no redirecionamento.
  for (const cookie of resposta.cookies.getAll()) redirecionamento.cookies.set(cookie)
  return redirecionamento
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
