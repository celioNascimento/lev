import { createBrowserClient } from '@supabase/ssr'
import { lerConfigSupabase } from '@/lib/env'

// Cliente para o navegador. Usa só a chave pública; a segurança vem do RLS no banco.
export function criarClienteNavegador() {
  const { url, chavePublica } = lerConfigSupabase()
  return createBrowserClient(url, chavePublica)
}
