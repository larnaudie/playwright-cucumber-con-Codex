import { BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, type Browser, type Page } from '@playwright/test';

// Código heredado: revisar su diseño durante el desafío.
export let browser: Browser;
export let page: Page;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

AfterAll(async function () {
  await browser.close();
});