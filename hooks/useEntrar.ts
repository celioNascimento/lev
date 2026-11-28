'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { validarCredenciais } from '@/lib/auth/validacao'
import { entrarComSenha } from '@/services/autenticacao'

// Estado e comportamento da tela de entrada. A tela só mostra o que este hook devolve.
export function useEntrar() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function entrar(email: string, senha: string) {
    if (enviando) return
    const invalido = validarCredenciais(email, senha)
    if (invalido) {
      setErro(invalido)
      return
    }
    setErro(null)
    setEnviando(true)
    const resultado = await entrarComSenha(email.trim(), senha)
    if (resultado.erro) {
      setErro(resultado.erro)
      setEnviando(false)
      return
    }
    router.replace('/')
    router.refresh()
  }

  return { enviando, erro, entrar }
}
