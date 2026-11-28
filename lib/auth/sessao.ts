import { criarClienteServidor } from '@/lib/supabase/server'

export type UsuarioAtual = {
  id: string
  email: string
  // Quantos aparelhos (apps autenticadores) a pessoa já confirmou.
  aparelhos: number
}

// Camada única de acesso à sessão no servidor. Confere o login com o Supabase a cada chamada.
export async function obterUsuarioAtual(): Promise<UsuarioAtual | null> {
  const supabase = await criarClienteServidor()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const aparelhos =
    data.user.factors?.filter((f) => f.factor_type === 'totp' && f.status === 'verified').length ?? 0
  return { id: data.user.id, email: data.user.email ?? '', aparelhos }
}
