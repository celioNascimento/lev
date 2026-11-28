import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Cliente com a chave de SERVIÇO: ignora RLS. Só para código de servidor (cron/sync).
// Nunca importe em componentes de cliente nem use prefixo NEXT_PUBLIC_.

export function lerConfigSupabaseAdmin(env: Record<string, string | undefined> = process.env): {
  url: string
  chaveServico: string
} {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const chaveServico = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const faltando = [
    !url && 'NEXT_PUBLIC_SUPABASE_URL',
    !chaveServico && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean)
  if (!url || !chaveServico) {
    throw new Error(`Faltam variáveis do Supabase: ${faltando.join(', ')}. Veja .env.example.`)
  }
  return { url, chaveServico }
}

export function criarClienteAdmin(): SupabaseClient {
  const { url, chaveServico } = lerConfigSupabaseAdmin()
  return createClient(url, chaveServico, { auth: { persistSession: false, autoRefreshToken: false } })
}
