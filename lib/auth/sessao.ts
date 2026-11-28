import { connection } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/server'

export type UsuarioAtual = {
  id: string
  email: string
  // Quantos aparelhos (apps autenticadores) a pessoa já confirmou.
  aparelhos: number
}

// Camada única de acesso à sessão no servidor. Confere o login com o Supabase a cada chamada.
export async function obterUsuarioAtual(): Promise<UsuarioAtual | null> {
  // Conferir o login usa a hora atual (Date.now) dentro da biblioteca do Supabase. Com
  // partialPrefetching, o Next pré-renderiza telas que leem a sessão e reclama desse uso.
  // connection() tira esta checagem do pré-render: ela roda sempre no momento do pedido,
  // que é o que queremos para decidir se alguém pode ver a área protegida.
  await connection()
  const supabase = await criarClienteServidor()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const aparelhos =
    data.user.factors?.filter((f) => f.factor_type === 'totp' && f.status === 'verified').length ?? 0
  return { id: data.user.id, email: data.user.email ?? '', aparelhos }
}
