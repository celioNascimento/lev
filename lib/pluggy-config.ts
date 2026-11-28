// Leitura das variáveis do Pluggy. SEGREDOS: só para código de servidor.
// Nunca importe este arquivo em componentes de cliente nem use prefixo NEXT_PUBLIC_.
// Falha dizendo só o NOME das variáveis que faltam, nunca os valores.

export type ConfigPluggy = {
  clientId: string
  clientSecret: string
  itemId: string
}

export function lerConfigPluggy(
  env: Record<string, string | undefined> = process.env,
): ConfigPluggy {
  const clientId = env.PLUGGY_CLIENT_ID?.trim()
  const clientSecret = env.PLUGGY_CLIENT_SECRET?.trim()
  const itemId = env.PLUGGY_ITEM_ID?.trim()

  const faltando = [
    !clientId && 'PLUGGY_CLIENT_ID',
    !clientSecret && 'PLUGGY_CLIENT_SECRET',
    !itemId && 'PLUGGY_ITEM_ID',
  ].filter(Boolean)

  if (!clientId || !clientSecret || !itemId) {
    throw new Error(`Faltam variáveis do Pluggy: ${faltando.join(', ')}. Veja .env.example.`)
  }
  return { clientId, clientSecret, itemId }
}
