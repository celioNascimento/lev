import { redirect } from 'next/navigation'
import { TelaConfigurarAparelho } from '@/components/TelaConfigurarAparelho'
import { obterUsuarioAtual } from '@/lib/auth/sessao'

// Lê no servidor quantos aparelhos a pessoa já confirmou e passa para a tela.
export async function ConfigurarAparelho() {
  const usuario = await obterUsuarioAtual()
  if (!usuario) redirect('/entrar')
  return <TelaConfigurarAparelho aparelhosCadastrados={usuario.aparelhos} />
}
