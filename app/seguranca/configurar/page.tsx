import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ConfigurarAparelho } from '@/components/ConfigurarAparelho'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = { title: 'Proteger a conta | Lev' }

export default function PaginaConfigurarAparelho() {
  return (
    <main className="fundo-entrada flex w-full flex-1 flex-col items-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Logo largura={96} />
          <h1 className="sr-only">Lev</h1>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">Proteja a sua conta</p>
            <p className="mt-1.5 text-base text-zinc-500">
              Como o Lev guarda informações financeiras, pedimos um código do celular a cada entrada.
            </p>
          </div>
        </header>
        <Suspense fallback={<p className="text-center text-base text-zinc-600">Carregando…</p>}>
          <ConfigurarAparelho />
        </Suspense>
      </div>
    </main>
  )
}
