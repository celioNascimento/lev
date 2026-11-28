import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { lerConfigSupabase } from '@/lib/env'

// Cliente para código de servidor (rotas e Server Components), com a sessão nos cookies.
export async function criarClienteServidor() {
  // Ler os cookies primeiro: isso marca a tela como "de tempo de pedido" e impede que o
  // build tente pré-renderizá-la (e esbarre na checagem das variáveis) sem sessão alguma.
  const cookieStore = await cookies()
  const { url, chavePublica } = lerConfigSupabase()
  return createServerClient(url, chavePublica, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) cookieStore.set(name, value, options)
        } catch {
          // Chamado de um Server Component: o cookie é renovado em outro ponto. Pode ignorar.
        }
      },
    },
  })
}
