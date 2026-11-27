import { describe, expect, it } from 'vitest'
import { lerConfigSupabase } from './env'

describe('lerConfigSupabase', () => {
  it('devolve url e chave quando ambas existem', () => {
    expect(
      lerConfigSupabase({
        NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abc',
      }),
    ).toEqual({ url: 'https://x.supabase.co', chavePublica: 'sb_publishable_abc' })
  })

  it('explica o que falta quando alguma variável não existe', () => {
    expect(() => lerConfigSupabase({ NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co' })).toThrow(
      /\.env\.example/,
    )
  })
})
