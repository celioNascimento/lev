import { expect, test } from '@playwright/test'

test('o site é instalável: o manifesto existe e tem ícones', async ({ request }) => {
  const resposta = await request.get('/manifest.webmanifest')
  expect(resposta.ok()).toBe(true)
  const manifesto = await resposta.json()
  expect(manifesto.name).toBe('Lev')
  expect(manifesto.display).toBe('standalone')
  expect(manifesto.icons.length).toBeGreaterThanOrEqual(2)
})
