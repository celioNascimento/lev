// Leitura das variáveis públicas do Supabase. Falha com mensagem clara em vez de
// quebrar mais tarde com um erro difícil de entender.
// Segredos (ex.: Pluggy) NUNCA ficam aqui: só em código de servidor, sem prefixo NEXT_PUBLIC_.

export function lerConfigSupabase(env: Record<string, string | undefined> = process.env): {
  url: string
  chavePublica: string
} {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const chavePublica = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !chavePublica) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Veja .env.example.',
    )
  }
  return { url, chavePublica }
}
