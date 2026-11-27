import { Suspense } from 'react'
import { AreaProtegida } from '@/components/AreaProtegida'
import { Logo } from '@/components/Logo'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <header className="flex items-center gap-4">
        <Logo largura={72} />
        <div>
          <h1 className="sr-only">Lev</h1>
          <p className="text-lg text-zinc-600">
            A gestão da casa, de um jeito simples. Escolha por onde começar.
          </p>
        </div>
      </header>
      {/* A sessão é lida em tempo de pedido, por isso fica atrás do Suspense. */}
      <Suspense fallback={<p className="text-base text-zinc-600">Carregando…</p>}>
        <AreaProtegida />
      </Suspense>
    </main>
  )
}
