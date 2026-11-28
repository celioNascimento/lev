import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormularioEntrar } from './FormularioEntrar'

describe('FormularioEntrar', () => {
  it('envia o e-mail e a senha digitados', async () => {
    const onEnviar = vi.fn()
    render(<FormularioEntrar enviando={false} erro={null} onEnviar={onEnviar} />)
    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(onEnviar).toHaveBeenCalledWith('a@b.com', 'segredo')
  })

  it('mostra o erro como alerta', () => {
    render(<FormularioEntrar enviando={false} erro="E-mail ou senha incorretos." onEnviar={vi.fn()} />)
    expect(screen.getByRole('alert').textContent).toBe('E-mail ou senha incorretos.')
  })

  it('desabilita o botão enquanto envia', () => {
    render(<FormularioEntrar enviando erro={null} onEnviar={vi.fn()} />)
    const botao = screen.getByRole('button', { name: 'Entrando…' }) as HTMLButtonElement
    expect(botao.disabled).toBe(true)
  })

  it('a senha fica escondida', () => {
    render(<FormularioEntrar enviando={false} erro={null} onEnviar={vi.fn()} />)
    expect((screen.getByLabelText('Senha') as HTMLInputElement).type).toBe('password')
  })
})
