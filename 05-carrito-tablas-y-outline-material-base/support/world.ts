import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';

export class CustomWorld extends World {
  context?: BrowserContext;
  page?: Page;

  get currentPage(): Page {
    if (!this.page) throw new Error('Before no inicializó la página');
    return this.page;
  }
}
setWorldConstructor(CustomWorld);