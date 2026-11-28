import { timingSafeEqual } from 'node:crypto'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { lerConfigPluggy } from '@/lib/pluggy-config'
import { criarBancoRepo } from '@/services/banco-repo'
import { criarClientePluggy } from '@/services/pluggy/cliente'
import { sincronizar } from '@/services/sincronizacao'

// Chamada 1x por dia pelo cron da Vercel (vercel.json). A Vercel manda
// "Authorization: Bearer <CRON_SECRET>"; sem esse segredo configurado, a rota recusa tudo.

export const maxDuration = 60

function segredoConfere(recebido: string | null, esperado: string): boolean {
  const a = Buffer.from(recebido ?? '')
  const b = Buffer.from(`Bearer ${esperado}`)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET
  if (!segredo) return Response.json({ ok: false, erro: 'CRON_SECRET não configurado' }, { status: 500 })
  if (!segredoConfere(request.headers.get('authorization'), segredo)) {
    return Response.json({ ok: false, erro: 'não autorizado' }, { status: 401 })
  }

  try {
    const config = lerConfigPluggy()
    const resultado = await sincronizar({
      cliente: criarClientePluggy({ config }),
      repo: criarBancoRepo(criarClienteAdmin()),
      config,
    })
    return Response.json(resultado)
  } catch (e) {
    // Mensagens dos nossos services não contêm segredos; mesmo assim, só o texto vai para o log.
    console.error('Falha na sincronização:', e instanceof Error ? e.message : 'erro desconhecido')
    return Response.json({ ok: false, erro: 'falha na sincronização' }, { status: 500 })
  }
}
