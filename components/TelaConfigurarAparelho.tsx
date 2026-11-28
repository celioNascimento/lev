'use client'

import { FormularioCodigo } from '@/components/FormularioCodigo'
import { useCadastroAparelho } from '@/hooks/useCadastroAparelho'

type Props = { aparelhosCadastrados: number }

const classeBotaoPrincipal =
  'rounded-2xl bg-lev-azul px-4 py-3.5 text-lg font-semibold text-white shadow-md shadow-lev-azul/20 transition hover:bg-lev-azul-escuro'
const classeBotaoSecundario =
  'rounded-2xl border border-zinc-300 bg-white px-4 py-3.5 text-lg font-medium text-zinc-800'

export function TelaConfigurarAparelho({ aparelhosCadastrados }: Props) {
  const c = useCadastroAparelho(aparelhosCadastrados)

  if (c.etapa === 'preparando') {
    return <p className="text-center text-base text-zinc-600">Preparando…</p>
  }

  if (c.etapa === 'falhou') {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-base text-red-800">
          {c.erro}
        </p>
        <button type="button" onClick={c.tentarDeNovo} className={classeBotaoPrincipal}>
          Tentar de novo
        </button>
      </div>
    )
  }

  if (c.etapa === 'oferta') {
    return (
      <div className="flex flex-col gap-5 text-center">
        <p className="text-xl font-semibold text-zinc-900">Aparelho cadastrado!</p>
        <p className="text-base text-zinc-600">
          Recomendamos cadastrar um segundo aparelho agora. Se você perder o celular, o outro continua
          dando acesso.
        </p>
        <button type="button" onClick={c.cadastrarOutro} className={classeBotaoPrincipal}>
          Cadastrar um segundo aparelho
        </button>
        <button type="button" onClick={c.terminar} className={classeBotaoSecundario}>
          Agora não
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-base text-zinc-700">
        <li>
          Abra um aplicativo autenticador no celular (Google Authenticator, Microsoft Authenticator ou
          Authy).
        </li>
        <li>Escolha adicionar uma conta e aponte a câmera para o quadrado abaixo.</li>
        <li>Digite aqui o código de 6 dígitos que o aplicativo mostrar.</li>
      </ol>

      <div className="flex justify-center">
        {/* QR gerado pelo Supabase em formato SVG embutido; não passa pelo otimizador de imagens. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.qrCode}
          alt={`Quadrado para cadastrar o ${c.nomeDoAparelho} no aplicativo autenticador`}
          width={200}
          height={200}
          className="rounded-2xl border border-zinc-200 bg-white p-2"
        />
      </div>

      <details className="rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-700">
        <summary className="cursor-pointer font-medium">Não consigo apontar a câmera</summary>
        <p className="mt-2">Digite esta chave no aplicativo, em &ldquo;inserir chave de configuração&rdquo;:</p>
        <p className="mt-2 break-all rounded-xl bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900" data-testid="chave-manual">
          {c.segredo}
        </p>
      </details>

      <FormularioCodigo
        enviando={c.enviando}
        erro={c.erro}
        rotuloBotao={`Confirmar ${c.nomeDoAparelho.toLowerCase()}`}
        onEnviar={c.confirmar}
      />
    </div>
  )
}
