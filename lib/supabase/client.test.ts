import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Regressão: no navegador, o Next só embute NEXT_PUBLIC_* quando aparecem por extenso
// como `process.env.NEXT_PUBLIC_...`. Ler de um objeto intermediário quebrava o login.
describe('cliente Supabase do navegador', () => {
  const fonte = readFileSync(join(process.cwd(), 'lib', 'supabase', 'client.ts'), 'utf8')

  it('cita as variáveis públicas por extenso', () => {
    expect(fonte).toContain('process.env.NEXT_PUBLIC_SUPABASE_URL')
    expect(fonte).toContain('process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  })

  it('não passa process.env inteiro para a leitura da config', () => {
    expect(/lerConfigSupabase\(\s*process\.env\s*\)/.test(fonte)).toBe(false)
    expect(/lerConfigSupabase\(\s*\)/.test(fonte)).toBe(false)
  })
})
