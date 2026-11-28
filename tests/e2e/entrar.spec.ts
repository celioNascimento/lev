import { expect, test } from '@playwright/test'
import { Secret, TOTP } from 'otpauth'

// Para o teste de entrada com sucesso, defina (conta de TESTE da homologação, já com 1 aparelho cadastrado):
//   E2E_EMAIL, E2E_SENHA e E2E_TOTP_SECRET (a chave em texto que a tela de cadastro mostra).
const email = process.env.E2E_EMAIL
const senha = process.env.E2E_SENHA
const chaveTotp = process.env.E2E_TOTP_SECRET

function codigoAtual(chave: string): string {
  return new TOTP({ secret: Secret.fromBase32(chave.replace(/\s/g, '')), digits: 6, period: 30 }).generate()
}

test('sem login, a tela inicial manda para /entrar', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/entrar$/)
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
})

test('sem login, as telas do segundo fator também mandam para /entrar', async ({ page }) => {
  await page.goto('/verificar')
  await expect(page).toHaveURL(/\/entrar$/)
  await page.goto('/seguranca/configurar')
  await expect(page).toHaveURL(/\/entrar$/)
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

test('entra com senha e código, vê a tela inicial e sai', async ({ page }) => {
  test.skip(!email || !senha || !chaveTotp, 'defina E2E_EMAIL, E2E_SENHA e E2E_TOTP_SECRET')
  await page.goto('/entrar')
  await page.getByLabel('E-mail', { exact: true }).fill(email!)
  await page.getByLabel('Senha', { exact: true }).fill(senha!)
  await page.getByRole('button', { name: 'Entrar' }).click()

  // Depois da senha, a tela pede o código do aplicativo.
  await expect(page).toHaveURL(/\/verificar$/)
  await page.getByLabel('Código de 6 dígitos').fill(codigoAtual(chaveTotp!))
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Cuidar do veículo' })).toBeVisible()
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/entrar$/)
})

test('só com a senha, a tela inicial não abre (pede o código)', async ({ page }) => {
  test.skip(!email || !senha || !chaveTotp, 'defina E2E_EMAIL, E2E_SENHA e E2E_TOTP_SECRET')
  await page.goto('/entrar')
  await page.getByLabel('E-mail', { exact: true }).fill(email!)
  await page.getByLabel('Senha', { exact: true }).fill(senha!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/verificar$/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/verificar$/)
})
