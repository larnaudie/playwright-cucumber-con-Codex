import { BeforeAll, Before, After, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, type Browser } from '@playwright/test';
import { CustomWorld } from './world';

let browser: Browser;
setDefaultTimeout(15_000);

BeforeAll(async function () {
  // En paralelo cada worker tiene su propio proceso y su propio browser.
  browser = await chromium.launch({ headless: process.env.HEADED !== '1' });
});

Before(async function (this: CustomWorld) {
  // Contexto nuevo por escenario: cookies y localStorage independientes.
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, { result }) {
  try {
    if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        await this.attach(screenshot, 'image/png');
      } catch (error) {
        await this.attach('No se pudo capturar evidencia: ' + String(error), 'text/plain');
      }
    }
  } finally {
    await this.context?.close();
  }
});

AfterAll(async function () {
  await browser?.close();
});