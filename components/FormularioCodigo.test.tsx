import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormularioCodigo } from './FormularioCodigo'

describe('FormularioCodigo', () => {
  it('envia só os dígitos, mesmo se a pessoa digitar espaço', async () => {
    const onEnviar = vi.fn()
    render(<FormularioCodigo enviando={false} erro={null} rotuloBotao="Confirmar" onEnviar={onEnviar} />)
    await userEvent.type(screen.getByLabelText('Código de 6 dígitos'), '123 456')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onEnviar).toHaveBeenCalledWith('123456')
  })

  it('ignora letras', async () => {
    render(<FormularioCodigo enviando={false} erro={null} rotuloBotao="Confirmar" onEnviar={vi.fn()} />)
    const campo = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement
    await userEvent.type(campo, 'a1b2')
    expect(campo.value).toBe('12')
  })

  it('usa o preenchimento automático de código do celular', () => {
    render(<FormularioCodigo enviando={false} erro={null} rotuloBotao="Confirmar" onEnviar={vi.fn()} />)
    const campo = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement
    expect(campo.getAttribute('autocomplete')).toBe('one-time-code')
    expect(campo.getAttribute('inputmode')).toBe('numeric')
  })

  it('mostra o erro como alerta e desabilita o botão enquanto confere', () => {
    render(<FormularioCodigo enviando erro="Código incorreto." rotuloBotao="Confirmar" onEnviar={vi.fn()} />)
    expect(screen.getByRole('alert').textContent).toBe('Código incorreto.')
    expect((screen.getByRole('button', { name: 'Conferindo…' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
