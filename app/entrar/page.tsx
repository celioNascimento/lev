import { Lock } from 'lucide-react'
import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'
import { TelaEntrar } from '@/components/TelaEntrar'

export const metadata: Metadata = { title: 'Entrar | Lev' }

export default function PaginaEntrar() {
  return (
    <main className="fundo-entrada flex w-full flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-9">
        <header className="flex flex-col items-center gap-5 text-center">
          <div className="aparecer">
            <Logo largura={168} />
          </div>
          <h1 className="sr-only">Lev</h1>
          {/* Fio fino da marca: azul que vira dourado. */}
          <div aria-hidden="true" className="aparecer h-px w-16 bg-gradient-to-r from-lev-azul to-lev-ouro" style={{ animationDelay: '120ms' }} />
          <div className="aparecer" style={{ animationDelay: '200ms' }}>
            <p className="text-2xl font-semibold text-zinc-900">Bem-vindo de volta</p>
            <p className="mt-1.5 text-base text-zinc-500">Entre para cuidar da casa com calma.</p>
          </div>
        </header>

        <div className="aparecer" style={{ animationDelay: '300ms' }}>
          <TelaEntrar />
        </div>

        <p
          className="aparecer flex items-center justify-center gap-2 text-sm text-zinc-400"
          style={{ animationDelay: '400ms' }}
        >
          <Lock size={14} aria-hidden="true" />
          Acesso restrito à família.
        </p>
      </div>
    </main>
  )
}
