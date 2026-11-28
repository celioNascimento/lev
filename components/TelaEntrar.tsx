'use client'

import { FormularioEntrar } from '@/components/FormularioEntrar'
import { useEntrar } from '@/hooks/useEntrar'

export function TelaEntrar() {
  const { enviando, erro, entrar } = useEntrar()
  return <FormularioEntrar enviando={enviando} erro={erro} onEnviar={entrar} />
}
