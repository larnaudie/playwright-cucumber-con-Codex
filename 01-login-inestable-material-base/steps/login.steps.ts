import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from '../support/hooks';

Given('que abro el portal', async function () {
  await page.goto('http://127.0.0.1:3100');
});

When('ingreso con el correo {string} y la contraseña {string}', async function (email: string, password: string) {
  await page.locator('input').nth(0).fill(email);
  await page.locator('input').nth(1).fill(password);
  page.locator('button').first().click();
  await page.waitForTimeout(500);
});

Then('veo el saludo {string}', async function (message: string) {
  expect(await page.locator('[role="status"]').textContent()).toBe(message);
});

Then('veo el error {string}', async function (message: string) {
  expect(await page.locator('[role="alert"]').textContent()).toBe(message);
});