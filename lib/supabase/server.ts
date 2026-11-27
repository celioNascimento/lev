import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { lerConfigSupabase } from '@/lib/env'

// Cliente para código de servidor (rotas e Server Components), com a sessão nos cookies.
export async function criarClienteServidor() {
  const { url, chavePublica } = lerConfigSupabase()
  const cookieStore = await cookies()
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
