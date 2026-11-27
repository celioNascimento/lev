import type { Ferramenta } from '@/lib/ferramentas'

type Props = { ferramenta: Ferramenta }

// Cartão de uma ferramenta na tela inicial. Só apresenta; não busca dados.
export function FerramentaCard({ ferramenta }: Props) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">{ferramenta.titulo}</h2>
      <p className="mt-1 text-base text-zinc-600">{ferramenta.descricao}</p>
      {!ferramenta.disponivel && (
        <p className="mt-3 inline-block rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
          Em breve
        </p>
      )}
    </li>
  )
}
