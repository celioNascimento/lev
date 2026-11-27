// Traduz erros do Supabase em frases simples. Nunca revela se o e-mail existe:
// e-mail inexistente e senha errada têm a mesma mensagem.

export type ErroAutenticacao = { code?: string; status?: number; message?: string } | null | undefined

export function traduzirErroLogin(erro: ErroAutenticacao): string {
  if (erro?.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (erro?.code === 'over_request_rate_limit' || erro?.status === 429) {
    return 'Muitas tentativas. Espere alguns minutos e tente de novo.'
  }
  if (erro?.message && /fetch|network/i.test(erro.message)) {
    return 'Sem conexão. Verifique a internet e tente de novo.'
  }
  return 'Não foi possível entrar agora. Tente de novo em instantes.'
}
