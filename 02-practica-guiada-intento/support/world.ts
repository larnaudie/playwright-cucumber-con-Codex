import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';

// Infraestructura preparada: no necesitás editar este archivo mañana.
export class CustomWorld extends World {
  context?: BrowserContext;
  page?: Page;

  get currentPage(): Page {
    if (!this.page) throw new Error('No se inicializó la página');
    return this.page;
  }
}
setWorldConstructor(CustomWorld);