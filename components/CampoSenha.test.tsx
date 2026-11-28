import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { CampoSenha } from './CampoSenha'

function Exemplo() {
  const [v, setV] = useState('segredo')
  return (
    <>
      <label htmlFor="senha">Senha</label>
      <CampoSenha id="senha" value={v} onChange={setV} />
    </>
  )
}

describe('CampoSenha', () => {
  it('começa com a senha escondida', () => {
    render(<Exemplo />)
    expect((screen.getByLabelText('Senha') as HTMLInputElement).type).toBe('password')
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeTruthy()
  })

  it('o botão alterna entre mostrar e ocultar', async () => {
    render(<Exemplo />)
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect((screen.getByLabelText('Senha') as HTMLInputElement).type).toBe('text')
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect((screen.getByLabelText('Senha') as HTMLInputElement).type).toBe('password')
  })

  it('digitar atualiza o valor', async () => {
    render(<Exemplo />)
    const campo = screen.getByLabelText('Senha') as HTMLInputElement
    await userEvent.type(campo, '123')
    expect(campo.value).toBe('segredo123')
  })
})
