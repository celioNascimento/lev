import { expect, test } from '@playwright/test'

test('a tela inicial mostra as três ferramentas', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Lev', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Contas e movimentações' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Planejar uma obra ou compra' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cuidar do veículo' })).toBeVisible()
})

test('o site é instalável: o manifesto existe e tem ícones', async ({ request }) => {
  const resposta = await request.get('/manifest.webmanifest')
  expect(resposta.ok()).toBe(true)
  const manifesto = await resposta.json()
  expect(manifesto.name).toBe('Lev')
  expect(manifesto.display).toBe('standalone')
  expect(manifesto.icons.length).toBeGreaterThanOrEqual(2)
})
