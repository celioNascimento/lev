'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { validarCodigo } from '@/lib/auth/codigo'
import { confirmarAparelho, iniciarCadastroDeAparelho } from '@/services/segundoFator'

export type EtapaDoCadastro = 'preparando' | 'escanear' | 'oferta' | 'falhou'

const APARELHOS_RECOMENDADOS = 2

// Estado e comportamento da tela de cadastrar o aplicativo autenticador (um aparelho por vez).
export function useCadastroAparelho(aparelhosJaCadastrados: number) {
  const router = useRouter()
  const [etapa, setEtapa] = useState<EtapaDoCadastro>('preparando')
  const [qrCode, setQrCode] = useState('')
  const [segredo, setSegredo] = useState('')
  const [nomeDoAparelho, setNomeDoAparelho] = useState('')
  const [fatorId, setFatorId] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [cadastradosAgora, setCadastradosAgora] = useState(0)
  const iniciando = useRef(false)

  const iniciar = useCallback(async () => {
    // Evita pedir dois QR ao mesmo tempo (o modo de desenvolvimento do React roda o efeito duas vezes).
    if (iniciando.current) return
    iniciando.current = true
    setEtapa('preparando')
    setErro(null)
    const r = await iniciarCadastroDeAparelho()
    iniciando.current = false
    if (!r.ok) {
      setErro(r.erro)
      setEtapa('falhou')
      return
    }
    setFatorId(r.fatorId)
    setQrCode(r.qrCode)
    setSegredo(r.segredo)
    setNomeDoAparelho(r.nomeDoAparelho)
    setEtapa('escanear')
  }, [])

  useEffect(() => {
    // Dispara o pedido do QR ao abrir a tela; o estado só muda depois da resposta (assíncrono).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void iniciar()
  }, [iniciar])

  function terminar() {
    router.replace('/')
    router.refresh()
  }

  async function confirmar(codigo: string) {
    if (enviando) return
    const invalido = validarCodigo(codigo)
    if (invalido) {
      setErro(invalido)
      return
    }
    setErro(null)
    setEnviando(true)
    const r = await confirmarAparelho(fatorId, codigo)
    setEnviando(false)
    if (r.erro) {
      setErro(r.erro)
      return
    }
    const total = aparelhosJaCadastrados + cadastradosAgora + 1
    setCadastradosAgora((n) => n + 1)
    if (total < APARELHOS_RECOMENDADOS) {
      setEtapa('oferta')
    } else {
      terminar()
    }
  }

  async function cadastrarOutro() {
    await iniciar()
  }

  return {
    etapa,
    qrCode,
    segredo,
    nomeDoAparelho,
    erro,
    enviando,
    confirmar,
    cadastrarOutro,
    tentarDeNovo: iniciar,
    terminar,
  }
}
