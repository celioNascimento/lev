'use client'

import { useState, type FormEvent } from 'react'
import { normalizarCodigo } from '@/lib/auth/codigo'

type Props = {
  enviando: boolean
  erro: string | null
  rotuloBotao: string
  onEnviar: (codigo: string) => void
}

// Campo do código de 6 dígitos. Só apresenta: validação e envio ficam nos hooks.
export function FormularioCodigo({ enviando, erro, rotuloBotao, onEnviar }: Props) {
  const [codigo, setCodigo] = useState('')

  function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onEnviar(codigo)
  }

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="codigo" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Código de 6 dígitos
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={7}
          value={codigo}
          onChange={(e) => setCodigo(normalizarCodigo(e.target.value))}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-zinc-900 shadow-sm transition focus:border-lev-azul focus:outline-none focus:ring-4 focus:ring-lev-azul/10"
        />
      </div>
      {erro && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-base text-red-800">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-2xl bg-lev-azul px-4 py-3.5 text-lg font-semibold text-white shadow-md shadow-lev-azul/20 transition hover:bg-lev-azul-escuro focus:outline-none focus-visible:ring-4 focus-visible:ring-lev-azul/30 disabled:opacity-60"
      >
        {enviando ? 'Conferindo…' : rotuloBotao}
      </button>
    </form>
  )
}
