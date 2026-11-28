import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'
import { TelaVerificar } from '@/components/TelaVerificar'

export const metadata: Metadata = { title: 'Confirmar código | Lev' }

export default function PaginaVerificar() {
  return (
    <main className="fundo-entrada flex w-full flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center">
          <Logo largura={110} />
          <h1 className="sr-only">Lev</h1>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">Quase lá</p>
            <p className="mt-1.5 text-base text-zinc-500">
              Abra o aplicativo autenticador e digite o código de 6 dígitos.
            </p>
          </div>
        </header>
        <TelaVerificar />
      </div>
    </main>
  )
}
