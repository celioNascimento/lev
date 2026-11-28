'use client'

import { useState, type FormEvent } from 'react'
import { CampoSenha } from '@/components/CampoSenha'

type Props = {
  enviando: boolean
  erro: string | null
  onEnviar: (email: string, senha: string) => void
}

// Formulário de entrada. Só apresenta: validação e envio ficam no hook useEntrar.
export function FormularioEntrar({ enviando, erro, onEnviar }: Props) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onEnviar(email, senha)
  }

  const classeCampo =
    'w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 transition focus:border-lev-azul focus:outline-none focus:ring-4 focus:ring-lev-azul/10'
  const classeRotulo = 'mb-1.5 block text-sm font-medium text-zinc-700'

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="email" className={classeRotulo}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={classeCampo}
        />
      </div>
      <div>
        <label htmlFor="senha" className={classeRotulo}>
          Senha
        </label>
        <CampoSenha id="senha" value={senha} onChange={setSenha} className={classeCampo} />
      </div>
      {erro && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-base text-red-800">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="mt-1 rounded-2xl bg-lev-azul px-4 py-3.5 text-lg font-semibold text-white shadow-md shadow-lev-azul/20 transition hover:bg-lev-azul-escuro focus:outline-none focus-visible:ring-4 focus-visible:ring-lev-azul/30 disabled:opacity-60"
      >
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
