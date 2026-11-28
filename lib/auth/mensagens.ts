// Traduz erros do Supabase em frases simples. Nunca revela se o e-mail existe:
// e-mail inexistente e senha errada têm a mesma mensagem.

export type ErroAutenticacao =
  | { code?: string; name?: string; status?: number; message?: string }
  | null
  | undefined

export function traduzirErroLogin(erro: ErroAutenticacao): string {
  if (erro?.code === 'invalid_credentials') return 'E-mail ou senha incorretos.'
  if (erro?.code === 'over_request_rate_limit' || erro?.status === 429) {
    return 'Muitas tentativas. Espere alguns minutos e tente de novo.'
  }
  // Falha de rede: o supabase-js marca como AuthRetryableFetchError (status 0).
  if (erro?.name === 'AuthRetryableFetchError' || erro?.status === 0) {
    return 'Sem conexão. Verifique a internet e tente de novo.'
  }
  if (erro?.message && /fetch|network|load failed/i.test(erro.message)) {
    return 'Sem conexão. Verifique a internet e tente de novo.'
  }
  return 'Não foi possível entrar agora. Tente de novo em instantes.'
}

// Erros do segundo fator (código do aplicativo autenticador).
export function traduzirErroMfa(erro: ErroAutenticacao): string {
  if (erro?.code === 'mfa_verification_failed') {
    return 'Código incorreto. Confira o aplicativo e tente de novo.'
  }
  if (erro?.code === 'over_request_rate_limit' || erro?.status === 429) {
    return 'Muitas tentativas. Espere alguns minutos e tente de novo.'
  }
  if (erro?.code === 'mfa_challenge_expired') {
    return 'O código demorou demais. Digite o código novo que o aplicativo mostrar.'
  }
  if (erro?.code === 'mfa_totp_enroll_not_enabled' || erro?.code === 'mfa_totp_verify_not_enabled') {
    return 'O segundo fator não está ligado neste projeto. Ligue em Authentication → Multi-Factor no painel do Supabase.'
  }
  if (erro?.name === 'AuthRetryableFetchError' || erro?.status === 0) {
    return 'Sem conexão. Verifique a internet e tente de novo.'
  }
  return 'Não foi possível verificar agora. Tente de novo em instantes.'
}
