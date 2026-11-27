'use client'

import { useState, type FormEvent } from 'react'

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
    'mt-1 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 focus:border-lev-azul focus:outline-none focus:ring-2 focus:ring-lev-azul/30'

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="email" className="text-base font-medium text-zinc-800">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={classeCampo}
        />
      </div>
      <div>
        <label htmlFor="senha" className="text-base font-medium text-zinc-800">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={classeCampo}
        />
      </div>
      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-800">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-xl bg-lev-azul px-4 py-3 text-lg font-semibold text-white hover:bg-lev-azul-escuro disabled:opacity-60"
      >
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
