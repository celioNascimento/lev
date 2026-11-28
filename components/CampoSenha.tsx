'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type Props = {
  id: string
  value: string
  onChange: (valor: string) => void
  className?: string
}

// Campo de senha com botão para mostrar/ocultar. Útil no celular, onde é fácil errar a digitação.
export function CampoSenha({ id, value, onChange, className }: Props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visivel ? 'text' : 'password'}
        autoComplete="current-password"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className ?? ''} pr-14`}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-2xl text-zinc-500 hover:text-lev-azul focus:outline-none focus-visible:ring-2 focus-visible:ring-lev-azul/40"
      >
        {visivel ? <EyeOff size={22} aria-hidden="true" /> : <Eye size={22} aria-hidden="true" />}
      </button>
    </div>
  )
}
