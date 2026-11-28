import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
const verificarCodigoDeEntrada = vi.fn()
vi.mock('@/services/segundoFator', () => ({
  verificarCodigoDeEntrada: (...a: unknown[]) => verificarCodigoDeEntrada(...a),
}))

import { useVerificacao } from './useVerificacao'

beforeEach(() => {
  replace.mockReset()
  refresh.mockReset()
  verificarCodigoDeEntrada.mockReset()
})

describe('useVerificacao', () => {
  it('não chama o servidor com código incompleto', async () => {
    const { result } = renderHook(() => useVerificacao())
    await act(() => result.current.verificar('123'))
    expect(result.current.erro).toMatch(/6 dígitos/)
    expect(verificarCodigoDeEntrada).not.toHaveBeenCalled()
  })

  it('mostra o erro e libera o botão quando o código é recusado', async () => {
    verificarCodigoDeEntrada.mockResolvedValue({ erro: 'Código incorreto. Confira o aplicativo e tente de novo.' })
    const { result } = renderHook(() => useVerificacao())
    await act(() => result.current.verificar('123456'))
    expect(result.current.erro).toMatch(/Código incorreto/)
    expect(result.current.enviando).toBe(false)
    expect(replace).not.toHaveBeenCalled()
  })

  it('com código aceito, vai para a tela inicial', async () => {
    verificarCodigoDeEntrada.mockResolvedValue({ erro: null })
    const { result } = renderHook(() => useVerificacao())
    await act(() => result.current.verificar('123 456'))
    expect(replace).toHaveBeenCalledWith('/')
    expect(result.current.erro).toBeNull()
  })
})
