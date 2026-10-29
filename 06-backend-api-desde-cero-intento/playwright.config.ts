import { defineConfig } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';
loadEnvFile(resolve(__dirname, '.env'));
export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'reports/html', open: 'never' }]],
  outputDir: 'reports/results',
  use: {
    baseURL: process.env.API_URL ?? 'http://127.0.0.1:3300',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
  // Servidor manual al principio para ver cliente y servidor por separado.
  // No usamos page: no hace falta instalar Chromium para estas pruebas.
});