import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FerramentaCard } from './FerramentaCard'

const base = { id: 'banco', titulo: 'Contas', descricao: 'Veja suas contas.' } as const

describe('FerramentaCard', () => {
  it('mostra título, descrição e o aviso "Em breve" quando indisponível', () => {
    render(<ul><FerramentaCard ferramenta={{ ...base, disponivel: false }} /></ul>)
    expect(screen.getByRole('heading', { name: 'Contas' })).toBeTruthy()
    expect(screen.getByText('Veja suas contas.')).toBeTruthy()
    expect(screen.getByText('Em breve')).toBeTruthy()
  })

  it('não mostra "Em breve" quando a ferramenta está disponível', () => {
    render(<ul><FerramentaCard ferramenta={{ ...base, disponivel: true }} /></ul>)
    expect(screen.queryByText('Em breve')).toBeNull()
  })
})
