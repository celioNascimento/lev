import { createBrowserClient } from '@supabase/ssr'
import { lerConfigSupabase } from '@/lib/env'

// Cliente para o navegador. Usa só a chave pública; a segurança vem do RLS no banco.
export function criarClienteNavegador() {
  // ATENÇÃO: no navegador o Next só embute NEXT_PUBLIC_* quando o código cita
  // `process.env.NEXT_PUBLIC_NOME` por extenso. Ler de um objeto intermediário
  // (como o padrão de lerConfigSupabase) devolve undefined aqui. Por isso são passadas
  // explicitamente. Não "simplifique" isto.
  const { url, chavePublica } = lerConfigSupabase({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })
  return createBrowserClient(url, chavePublica)
}
