// Regra de quais telas cada pessoa pode abrir, conforme o estágio do login.
// Pura, para poder testar sem navegador.
//
// Estágios:
//  - sem login            -> só /entrar
//  - senha ok, sem aparelho cadastrado -> só /seguranca/configurar (cadastrar o 1º aparelho)
//  - senha ok, com aparelho, sem código -> só /verificar
//  - senha + código (aal2) -> tudo, menos /entrar e /verificar

export type EstadoDeAcesso = {
  logado: boolean
  // Nível de segurança da sessão: aal1 = só senha; aal2 = senha + código.
  nivel: 'aal1' | 'aal2' | null
  temAparelho: boolean
}

export type DecisaoDeRota = { tipo: 'seguir' } | { tipo: 'redirecionar'; para: string }

const ENTRAR = '/entrar'
const VERIFICAR = '/verificar'
const CONFIGURAR = '/seguranca/configurar'

function seguir(): DecisaoDeRota {
  return { tipo: 'seguir' }
}
function ir(para: string): DecisaoDeRota {
  return { tipo: 'redirecionar', para }
}

export function decidirRota(caminho: string, estado: EstadoDeAcesso): DecisaoDeRota {
  if (!estado.logado) return caminho === ENTRAR ? seguir() : ir(ENTRAR)

  if (estado.nivel !== 'aal2') {
    const destino = estado.temAparelho ? VERIFICAR : CONFIGURAR
    return caminho === destino ? seguir() : ir(destino)
  }

  // Senha + código: não faz sentido voltar às telas de passagem.
  if (caminho === ENTRAR || caminho === VERIFICAR) return ir('/')
  return seguir()
}

// Rotas que se protegem sozinhas, com um segredo próprio, e por isso NÃO passam pela barreira
// de login: quem chama (o agendador da Vercel) não tem sessão nem cookies.
// Toda rota nova sob /api/cron/ precisa conferir o CRON_SECRET por conta própria.
export function rotaComSegredoProprio(caminho: string): boolean {
  return caminho.startsWith('/api/cron/')
}
