// Validação do formulário de entrada, antes de falar com o servidor.
// Mensagens em português simples. Não exigimos tamanho de senha aqui: quem manda é o Supabase.

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarCredenciais(email: string, senha: string): string | null {
  if (!email.trim()) return 'Digite seu e-mail.'
  if (!FORMATO_EMAIL.test(email.trim())) return 'Esse e-mail não parece correto. Confira e tente de novo.'
  if (!senha) return 'Digite sua senha.'
  return null
}
