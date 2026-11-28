import { describe, expect, it } from 'vitest'
import { lerConfigSupabaseAdmin } from './admin'

describe('lerConfigSupabaseAdmin', () => {
  it('lê URL e chave de serviço', () => {
    expect(
      lerConfigSupabaseAdmin({ NEXT_PUBLIC_SUPABASE_URL: 'https://x', SUPABASE_SERVICE_ROLE_KEY: 'k' }),
    ).toEqual({ url: 'https://x', chaveServico: 'k' })
  })

  it('falha só com os NOMES do que falta', () => {
    expect(() => lerConfigSupabaseAdmin({ NEXT_PUBLIC_SUPABASE_URL: 'https://x' })).toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/,
    )
  })
})
