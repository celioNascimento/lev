import { describe, expect, it } from 'vitest'
import { FERRAMENTAS } from './ferramentas'

describe('FERRAMENTAS', () => {
  it('tem as três ferramentas planejadas, sem ids repetidos', () => {
    const ids = FERRAMENTAS.map((f) => f.id)
    expect(ids).toEqual(['banco', 'planejamento', 'veiculo'])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todas têm título e descrição preenchidos', () => {
    for (const f of FERRAMENTAS) {
      expect(f.titulo.trim()).not.toBe('')
      expect(f.descricao.trim()).not.toBe('')
    }
  })
})
