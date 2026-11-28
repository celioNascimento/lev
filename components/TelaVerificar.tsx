'use client'

import { BotaoSair } from '@/components/BotaoSair'
import { FormularioCodigo } from '@/components/FormularioCodigo'
import { useVerificacao } from '@/hooks/useVerificacao'

export function TelaVerificar() {
  const { enviando, erro, verificar } = useVerificacao()
  return (
    <div className="flex flex-col gap-6">
      <FormularioCodigo enviando={enviando} erro={erro} rotuloBotao="Continuar" onEnviar={verificar} />
      <div className="flex justify-center">
        <BotaoSair rotulo="Entrar com outra conta" />
      </div>
    </div>
  )
}
