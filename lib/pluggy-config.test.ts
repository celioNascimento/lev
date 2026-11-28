import { describe, expect, it } from 'vitest'
import { lerConfigPluggy } from './pluggy-config'

describe('lerConfigPluggy', () => {
  it('lê as três variáveis e tira espaços das pontas', () => {
    const c = lerConfigPluggy({
      PLUGGY_CLIENT_ID: ' id ',
      PLUGGY_CLIENT_SECRET: 'segredo',
      PLUGGY_ITEM_ID: 'item',
    })
    expect(c).toEqual({ clientId: 'id', clientSecret: 'segredo', itemId: 'item' })
  })

  it('diz só os NOMES do que falta, sem valores', () => {
    expect(() => lerConfigPluggy({ PLUGGY_CLIENT_SECRET: 'valor-secreto' })).toThrow(
      /PLUGGY_CLIENT_ID, PLUGGY_ITEM_ID/,
    )
    try {
      lerConfigPluggy({ PLUGGY_CLIENT_SECRET: 'valor-secreto' })
    } catch (e) {
      expect(String(e)).not.toContain('valor-secreto')
    }
  })

  it('trata valor vazio como faltando', () => {
    expect(() =>
      lerConfigPluggy({ PLUGGY_CLIENT_ID: '', PLUGGY_CLIENT_SECRET: 'a', PLUGGY_ITEM_ID: 'b' }),
    ).toThrow(/PLUGGY_CLIENT_ID/)
  })
})
