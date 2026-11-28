import { defineConfig, devices } from '@playwright/test'

// Por padrão sobe o site localmente. Para testar um endereço já publicado
// (homologação), defina E2E_BASE_URL e o servidor local não é iniciado.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  // E2E_CHROME_PATH permite usar um Chrome já instalado em vez de baixar o do Playwright.
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: { executablePath: process.env.E2E_CHROME_PATH || undefined, args: process.env.E2E_CHROME_PATH ? ['--no-sandbox'] : [] },
  },
  projects: [{ name: 'celular', use: { ...devices['Pixel 7'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
