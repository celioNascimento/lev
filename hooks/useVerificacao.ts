'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { validarCodigo } from '@/lib/auth/codigo'
import { verificarCodigoDeEntrada } from '@/services/segundoFator'

// Estado e comportamento da tela "digite o código" que vem logo depois da senha.
export function useVerificacao() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function verificar(codigo: string) {
    if (enviando) return
    const invalido = validarCodigo(codigo)
    if (invalido) {
      setErro(invalido)
      return
    }
    setErro(null)
    setEnviando(true)
    const resultado = await verificarCodigoDeEntrada(codigo)
    if (resultado.erro) {
      setErro(resultado.erro)
      setEnviando(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return { enviando, erro, verificar }
}
