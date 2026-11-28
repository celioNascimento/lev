import { criarClienteNavegador } from '@/lib/supabase/client'
import { traduzirErroLogin } from '@/lib/auth/mensagens'

export type ResultadoEntrada = { erro: string | null }

// Entra com e-mail e senha. Devolve uma frase pronta para mostrar, ou null se deu certo.
export async function entrarComSenha(email: string, senha: string): Promise<ResultadoEntrada> {
  try {
    const { error } = await criarClienteNavegador().auth.signInWithPassword({ email, password: senha })
    return { erro: error ? traduzirErroLogin(error) : null }
  } catch (e) {
    // Sem dados sensíveis: só o motivo técnico, para diagnóstico no console do navegador.
    console.error('Falha inesperada ao entrar:', e instanceof Error ? e.message : e)
    return { erro: traduzirErroLogin({ name: e instanceof Error ? e.name : undefined, message: e instanceof Error ? e.message : undefined }) }
  }
}

export async function sair(): Promise<void> {
  await criarClienteNavegador().auth.signOut()
}
