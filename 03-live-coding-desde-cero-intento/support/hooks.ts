// Lo construiremos juntos: por ahora no se inicia ni se cierra ningún navegador.
import { Before, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { chromium, type Browser } from '@playwright/test';
import { CustomWorld } from './world';

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: false });
});

AfterAll(async function () {
  await browser?.close();
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
});