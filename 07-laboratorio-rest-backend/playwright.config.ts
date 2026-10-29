import { defineConfig } from '@playwright/test';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';

loadEnvFile(resolve(__dirname,'.env'));

export default defineConfig({
  testDir: './tests',
  retries: 0,
  workers: 1,
  timeout: 15_000,
  reporter: [['list'], ['html', { outputFolder: 'reports/html', open: 'never' }]],
  outputDir: 'reports/results',
  use: {
    baseURL: process.env.API_URL ?? 'http://127.0.0.1:3400',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});