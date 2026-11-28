import { expect, test } from '@playwright/test'

// Para o teste de entrada com sucesso, defina E2E_EMAIL e E2E_SENHA (conta de TESTE da homologação).
const email = process.env.E2E_EMAIL
const senha = process.env.E2E_SENHA

test('sem login, a tela inicial manda para /entrar', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/entrar$/)
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
})

test('campos vazios mostram um aviso simples', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('form p[role="alert"]')).toHaveText('Digite seu e-mail.')
})

test('senha errada mostra a mesma mensagem de sempre', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel('E-mail', { exact: true }).fill('nao.existe@exemplo.invalid')
  await page.getByLabel('Senha', { exact: true }).fill('senha-errada-123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('form p[role="alert"]')).toHaveText('E-mail ou senha incorretos.')
})

test('entra com a conta de teste e sai', async ({ page }) => {
  test.skip(!email || !senha, 'defina E2E_EMAIL e E2E_SENHA')
  await page.goto('/entrar')
  await page.getByLabel('E-mail', { exact: true }).fill(email!)
  await page.getByLabel('Senha', { exact: true }).fill(senha!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Cuidar do veículo' })).toBeVisible()
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/entrar$/)
})
