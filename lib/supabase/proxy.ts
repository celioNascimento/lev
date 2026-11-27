import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { lerConfigSupabase } from '@/lib/env'

// Renova a sessão (cookies) a cada pedido e diz quem está logado.
// getUser() confere o login com o servidor do Supabase; não confia só no cookie.
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
  return { resposta, usuario: data.user }
}
