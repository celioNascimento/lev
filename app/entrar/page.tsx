import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'
import { TelaEntrar } from '@/components/TelaEntrar'

export const metadata: Metadata = { title: 'Entrar | Lev' }

export default function PaginaEntrar() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-10">
      <header className="flex flex-col items-center gap-4 text-center">
        <Logo largura={140} />
        <h1 className="sr-only">Lev</h1>
        <p className="text-lg text-zinc-600">Entre para ver a sua casa.</p>
      </header>
      <TelaEntrar />
    </main>
  )
}
