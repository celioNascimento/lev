// Código de 6 dígitos do aplicativo autenticador.

export const TAMANHO_CODIGO = 6

// Tira espaços e traços (alguns apps mostram "123 456") e deixa só os dígitos.
export function normalizarCodigo(texto: string): string {
  return texto.replace(/\D/g, '').slice(0, TAMANHO_CODIGO)
}

export function validarCodigo(texto: string): string | null {
  const codigo = normalizarCodigo(texto)
  if (!codigo) return 'Digite o código de 6 dígitos do aplicativo.'
  if (codigo.length < TAMANHO_CODIGO) return 'O código tem 6 dígitos. Confira e tente de novo.'
  return null
}
