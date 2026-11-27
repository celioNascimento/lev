// Regra de quais telas exigem login. Pura, para poder testar sem navegador.

const ROTAS_PUBLICAS = ['/entrar']

export type DecisaoDeRota = { tipo: 'seguir' } | { tipo: 'redirecionar'; para: string }

export function decidirRota(caminho: string, temUsuario: boolean): DecisaoDeRota {
  const publica = ROTAS_PUBLICAS.includes(caminho)
  if (!temUsuario && !publica) return { tipo: 'redirecionar', para: '/entrar' }
  if (temUsuario && caminho === '/entrar') return { tipo: 'redirecionar', para: '/' }
  return { tipo: 'seguir' }
}
