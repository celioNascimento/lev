import { Suspense } from 'react'
import { AreaProtegida } from '@/components/AreaProtegida'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Lev</h1>
        <p className="mt-2 text-lg text-zinc-600">
          A gestão da casa, de um jeito simples. Escolha por onde começar.
        </p>
      </header>
      {/* A sessão é lida em tempo de pedido, por isso fica atrás do Suspense. */}
      <Suspense fallback={<p className="text-base text-zinc-600">Carregando…</p>}>
        <AreaProtegida />
      </Suspense>
    </main>
  )
}
