import { NextResponse, type NextRequest } from 'next/server'
import { decidirRota, rotaComSegredoProprio } from '@/lib/auth/rotas'
import { atualizarSessao } from '@/lib/supabase/proxy'

// Primeira barreira: conforme o estágio do login (veja lib/auth/rotas.ts), só algumas telas abrem.
// A segunda é a checagem no servidor dentro da própria tela (components/AreaProtegida)
// e a última é o RLS no banco, que também exige o código (nível aal2).
export async function proxy(request: NextRequest) {
  // Rotas do agendador não têm sessão; elas conferem o CRON_SECRET dentro da própria rota.
  if (rotaComSegredoProprio(request.nextUrl.pathname)) return NextResponse.next()

  const { resposta, estado } = await atualizarSessao(request)
  const decisao = decidirRota(request.nextUrl.pathname, estado)
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
