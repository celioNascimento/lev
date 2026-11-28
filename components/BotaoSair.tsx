'use client'

import { useRouter } from 'next/navigation'
import { sair } from '@/services/autenticacao'

type Props = { rotulo?: string }

export function BotaoSair({ rotulo = 'Sair' }: Props) {
  const router = useRouter()

  async function aoClicar() {
    await sair()
    router.replace('/entrar')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-base font-medium text-zinc-800"
    >
      {rotulo}
    </button>
  )
}
