import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('que abro el portal', async function (this: CustomWorld) {
  await this.currentPage.goto(process.env.BASE_URL ?? 'http://127.0.0.1:3100');
});

When('ingreso con el correo {string} y la contraseña {string}', async function (this: CustomWorld, email: string, password: string) {
  // TODO: localizar los dos campos y el botón mediante roles o labels.
  // Todas las acciones asíncronas deben esperarse.
  throw new Error('TODO: implementar ingreso');
});

Then('veo el saludo {string}', async function (this: CustomWorld, message: string) {
  // TODO: comprobar visibilidad y texto con aserciones sobre locators.
  throw new Error('TODO: implementar saludo');
});

Then('veo el error {string}', async function (this: CustomWorld, message: string) {
  // TODO: comprobar el mensaje visible de rechazo.
  throw new Error('TODO: implementar error');
});

// Segunda parte: agregá steps y un escenario de logout cuando termines lo anterior.