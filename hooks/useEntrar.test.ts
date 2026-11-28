import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()
const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }))
const entrarComSenha = vi.fn()
vi.mock('@/services/autenticacao', () => ({ entrarComSenha: (...a: unknown[]) => entrarComSenha(...a) }))

import { useEntrar } from './useEntrar'

describe('useEntrar', () => {
  beforeEach(() => {
    replace.mockReset()
    refresh.mockReset()
    entrarComSenha.mockReset()
  })

  it('não chama o servidor quando o formulário está incompleto', async () => {
    const { result } = renderHook(() => useEntrar())
    await act(() => result.current.entrar('', 'x'))
    expect(result.current.erro).toBe('Digite seu e-mail.')
    expect(entrarComSenha).not.toHaveBeenCalled()
  })

  it('mostra o erro devolvido e libera o botão de novo', async () => {
    entrarComSenha.mockResolvedValue({ erro: 'E-mail ou senha incorretos.' })
    const { result } = renderHook(() => useEntrar())
    await act(() => result.current.entrar('a@b.com', 'errada'))
    expect(result.current.erro).toBe('E-mail ou senha incorretos.')
    expect(result.current.enviando).toBe(false)
    expect(replace).not.toHaveBeenCalled()
  })

  it('em caso de sucesso, vai para a tela inicial', async () => {
    entrarComSenha.mockResolvedValue({ erro: null })
    const { result } = renderHook(() => useEntrar())
    await act(() => result.current.entrar('  a@b.com ', 'certa'))
    expect(entrarComSenha).toHaveBeenCalledWith('a@b.com', 'certa')
    expect(replace).toHaveBeenCalledWith('/')
    expect(result.current.erro).toBeNull()
  })
})
