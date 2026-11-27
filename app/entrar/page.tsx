import type { Metadata } from 'next'
import { TelaEntrar } from '@/components/TelaEntrar'

export const metadata: Metadata = { title: 'Entrar | Lev' }

export default function PaginaEntrar() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-10">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Lev</h1>
        <p className="mt-2 text-lg text-zinc-600">Entre para ver a sua casa.</p>
      </header>
      <TelaEntrar />
    </main>
  )
}
