import { criarClienteServidor } from '@/lib/supabase/server'

export type UsuarioAtual = { id: string; email: string }

// Camada única de acesso à sessão no servidor. Confere o login com o Supabase a cada chamada.
export async function obterUsuarioAtual(): Promise<UsuarioAtual | null> {
  const supabase = await criarClienteServidor()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return { id: data.user.id, email: data.user.email ?? '' }
}
