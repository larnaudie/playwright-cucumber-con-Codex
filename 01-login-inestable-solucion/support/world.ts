import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export class CustomWorld extends World {
  context?: BrowserContext;
  page?: Page;

  get login(): LoginPage {
    if (!this.page) throw new Error('El navegador no fue inicializado');
    return new LoginPage(this.page);
  }
}
setWorldConstructor(CustomWorld);