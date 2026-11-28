import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const pasta = join(process.cwd(), 'supabase', 'migrations')
const arquivos = readdirSync(pasta).filter((f) => f.endsWith('.sql'))
const sql = arquivos.map((f) => ({ f, texto: readFileSync(join(pasta, f), 'utf8') }))

describe('migrations', () => {
  it('existe ao menos uma migration', () => {
    expect(arquivos.length).toBeGreaterThan(0)
  })

  it('toda tabela criada em public liga o RLS na mesma migration', () => {
    for (const { f, texto } of sql) {
      const tabelas = [...texto.matchAll(/create table (?:if not exists )?public\.(\w+)/gi)].map((m) => m[1])
      for (const t of tabelas) {
        const liga = new RegExp(`alter table public\\.${t} enable row level security`, 'i')
        expect(liga.test(texto), `${f}: tabela ${t} sem RLS`).toBe(true)
      }
    }
  })

  it('nenhuma função SECURITY DEFINER fica sem search_path fixo', () => {
    for (const { f, texto } of sql) {
      const funcoes = texto.split(/create (?:or replace )?function/i).slice(1)
      for (const corpo of funcoes) {
        if (/security definer/i.test(corpo)) {
          expect(/set search_path\s*=\s*''/i.test(corpo), `${f}: security definer sem search_path`).toBe(true)
        }
      }
    }
  })

  it('nada é liberado para o papel anon', () => {
    for (const { f, texto } of sql) {
      expect(/grant [^;]*\bto\b[^;]*\banon\b/i.test(texto), `${f}: grant para anon`).toBe(false)
    }
  })
})
