import { redirect } from 'next/navigation'
import { BotaoSair } from '@/components/BotaoSair'
import { FerramentaCard } from '@/components/FerramentaCard'
import { FERRAMENTAS } from '@/lib/ferramentas'
import { obterUsuarioAtual } from '@/lib/auth/sessao'

// Tudo o que só quem está logado pode ver. Lê a sessão no servidor a cada visita.
export async function AreaProtegida() {
  const usuario = await obterUsuarioAtual()
  if (!usuario) redirect('/entrar')

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-base text-zinc-600">
          Você entrou como <strong className="text-zinc-900">{usuario.email}</strong>
        </p>
        <BotaoSair />
      </div>
      <ul className="flex flex-col gap-4">
        {FERRAMENTAS.map((f) => (
          <FerramentaCard key={f.id} ferramenta={f} />
        ))}
      </ul>
    </>
  )
}
