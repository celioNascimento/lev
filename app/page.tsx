import { FerramentaCard } from '@/components/FerramentaCard'
import { FERRAMENTAS } from '@/lib/ferramentas'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-10">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Lev</h1>
        <p className="mt-2 text-lg text-zinc-600">
          A gestão da casa, de um jeito simples. Escolha por onde começar.
        </p>
      </header>
      <ul className="flex flex-col gap-4">
        {FERRAMENTAS.map((f) => (
          <FerramentaCard key={f.id} ferramenta={f} />
        ))}
      </ul>
    </main>
  )
}
