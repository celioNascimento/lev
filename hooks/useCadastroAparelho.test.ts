import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
const iniciar = vi.fn()
const confirmarAparelho = vi.fn()
vi.mock('@/services/segundoFator', () => ({
  iniciarCadastroDeAparelho: (...a: unknown[]) => iniciar(...a),
  confirmarAparelho: (...a: unknown[]) => confirmarAparelho(...a),
}))

import { useCadastroAparelho } from './useCadastroAparelho'

const ok = { ok: true, fatorId: 'f1', qrCode: 'data:...', segredo: 'SEGREDO', nomeDoAparelho: 'Aparelho 1' }

beforeEach(() => {
  replace.mockReset()
  refresh.mockReset()
  iniciar.mockReset()
  confirmarAparelho.mockReset()
})

describe('useCadastroAparelho', () => {
  it('ao abrir, pede o QR e mostra a etapa de escanear', async () => {
    iniciar.mockResolvedValue(ok)
    const { result } = renderHook(() => useCadastroAparelho(0))
    expect(result.current.etapa).toBe('preparando')
    await waitFor(() => expect(result.current.etapa).toBe('escanear'))
    expect(result.current.segredo).toBe('SEGREDO')
    expect(iniciar).toHaveBeenCalledTimes(1)
  })

  it('mostra a falha quando não consegue preparar o cadastro', async () => {
    iniciar.mockResolvedValue({ ok: false, erro: 'Sem conexão. Verifique a internet e tente de novo.' })
    const { result } = renderHook(() => useCadastroAparelho(0))
    await waitFor(() => expect(result.current.etapa).toBe('falhou'))
    expect(result.current.erro).toMatch(/Sem conexão/)
  })

  it('primeiro aparelho confirmado: oferece o segundo, sem sair da tela', async () => {
    iniciar.mockResolvedValue(ok)
    confirmarAparelho.mockResolvedValue({ erro: null })
    const { result } = renderHook(() => useCadastroAparelho(0))
    await waitFor(() => expect(result.current.etapa).toBe('escanear'))
    await act(() => result.current.confirmar('123456'))
    expect(result.current.etapa).toBe('oferta')
    expect(replace).not.toHaveBeenCalled()
  })

  it('segundo aparelho confirmado: vai para a tela inicial', async () => {
    iniciar.mockResolvedValue(ok)
    confirmarAparelho.mockResolvedValue({ erro: null })
    const { result } = renderHook(() => useCadastroAparelho(1))
    await waitFor(() => expect(result.current.etapa).toBe('escanear'))
    await act(() => result.current.confirmar('123456'))
    expect(replace).toHaveBeenCalledWith('/')
  })

  it('código incorreto: continua na etapa de escanear com o aviso', async () => {
    iniciar.mockResolvedValue(ok)
    confirmarAparelho.mockResolvedValue({ erro: 'Código incorreto. Confira o aplicativo e tente de novo.' })
    const { result } = renderHook(() => useCadastroAparelho(0))
    await waitFor(() => expect(result.current.etapa).toBe('escanear'))
    await act(() => result.current.confirmar('000000'))
    expect(result.current.etapa).toBe('escanear')
    expect(result.current.erro).toMatch(/Código incorreto/)
  })

  it('não chama o servidor com código incompleto', async () => {
    iniciar.mockResolvedValue(ok)
    const { result } = renderHook(() => useCadastroAparelho(0))
    await waitFor(() => expect(result.current.etapa).toBe('escanear'))
    await act(() => result.current.confirmar('12'))
    expect(confirmarAparelho).not.toHaveBeenCalled()
    expect(result.current.erro).toMatch(/6 dígitos/)
  })
})
