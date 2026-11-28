import { traduzirErroMfa } from '@/lib/auth/mensagens'
import { normalizarCodigo } from '@/lib/auth/codigo'
import { criarClienteNavegador } from '@/lib/supabase/client'

export type ResultadoSimples = { erro: string | null }

export type CadastroIniciado =
  | { ok: true; fatorId: string; qrCode: string; segredo: string; nomeDoAparelho: string }
  | { ok: false; erro: string }

function erroDeRede(e: unknown): string {
  return traduzirErroMfa({
    name: e instanceof Error ? e.name : undefined,
    message: e instanceof Error ? e.message : undefined,
  })
}

// Começa o cadastro de um aparelho: apaga tentativas antigas não confirmadas e pede um novo QR.
export async function iniciarCadastroDeAparelho(): Promise<CadastroIniciado> {
  try {
    const mfa = criarClienteNavegador().auth.mfa
    const { data: lista, error: erroLista } = await mfa.listFactors()
    if (erroLista) return { ok: false, erro: traduzirErroMfa(erroLista) }

    // Tentativas anteriores que ficaram pela metade atrapalham (o nome do aparelho precisa ser único).
    for (const f of lista.all.filter((x) => x.factor_type === 'totp' && x.status === 'unverified')) {
      await mfa.unenroll({ factorId: f.id })
    }

    const nomeDoAparelho = `Aparelho ${lista.totp.length + 1}`
    const { data, error } = await mfa.enroll({ factorType: 'totp', friendlyName: nomeDoAparelho })
    if (error || !data) return { ok: false, erro: traduzirErroMfa(error) }

    return {
      ok: true,
      fatorId: data.id,
      qrCode: `data:image/svg+xml;utf-8,${data.totp.qr_code}`,
      segredo: data.totp.secret,
      nomeDoAparelho,
    }
  } catch (e) {
    return { ok: false, erro: erroDeRede(e) }
  }
}

// Confirma o aparelho com o primeiro código que ele mostra.
export async function confirmarAparelho(fatorId: string, codigo: string): Promise<ResultadoSimples> {
  try {
    const { error } = await criarClienteNavegador().auth.mfa.challengeAndVerify({
      factorId: fatorId,
      code: normalizarCodigo(codigo),
    })
    return { erro: error ? traduzirErroMfa(error) : null }
  } catch (e) {
    return { erro: erroDeRede(e) }
  }
}

// Confere o código ao entrar. Com dois aparelhos, o código de um só vale para o seu próprio
// cadastro, então tenta em cada aparelho confirmado até um aceitar.
export async function verificarCodigoDeEntrada(codigo: string): Promise<ResultadoSimples> {
  try {
    const mfa = criarClienteNavegador().auth.mfa
    const { data, error } = await mfa.listFactors()
    if (error) return { erro: traduzirErroMfa(error) }
    if (data.totp.length === 0) return { erro: 'Nenhum aparelho cadastrado. Entre de novo.' }

    let ultimoErro: Parameters<typeof traduzirErroMfa>[0] = null
    for (const fator of data.totp) {
      const { error: erroVerificacao } = await mfa.challengeAndVerify({
        factorId: fator.id,
        code: normalizarCodigo(codigo),
      })
      if (!erroVerificacao) return { erro: null }
      ultimoErro = erroVerificacao
      // Se o problema não for "código errado", tentar o outro aparelho não ajuda.
      if (erroVerificacao.code !== 'mfa_verification_failed') break
    }
    return { erro: traduzirErroMfa(ultimoErro) }
  } catch (e) {
    return { erro: erroDeRede(e) }
  }
}
