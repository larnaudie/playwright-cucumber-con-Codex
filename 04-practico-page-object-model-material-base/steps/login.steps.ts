import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { environment } from '../config/environment';

// BASE SIN POM: primero ejecutar; luego refactorizar de a una etapa.
Given('que abro el portal', async function (this: CustomWorld) {
  await this.currentPage.goto(environment.baseURL);
});

When(
  'ingreso con el correo {string} y la contraseña {string}',
  async function (this: CustomWorld, email: string, password: string) {
    await this.currentPage.getByLabel('Correo electrónico', { exact: true }).fill(email);
    await this.currentPage.getByLabel('Contraseña', { exact: true }).fill(password);
    await this.currentPage.getByRole('button', { name: 'Ingresar', exact: true }).click();
  }
);

Then('veo el saludo {string}', async function (this: CustomWorld, message: string) {
  const greeting = this.currentPage.getByRole('status');
  await expect(greeting).toBeVisible();
  await expect(greeting).toHaveText(message);
});

Then('veo el error {string}', async function (this: CustomWorld, message: string) {
  const alert = this.currentPage.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toHaveText(message);
  await expect(
    this.currentPage.getByRole('button', { name: 'Ingresar', exact: true })
  ).toBeVisible();
});