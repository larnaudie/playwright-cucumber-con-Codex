import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(process.env.BASE_URL ?? 'http://127.0.0.1:3100');
    await this.expectLoginForm();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel('Correo electrónico', { exact: true }).fill(email);
    await this.page.getByLabel('Contraseña', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  }

  async expectGreeting(message: string): Promise<void> {
    const greeting = this.page.getByRole('status');
    await expect(greeting).toBeVisible();
    await expect(greeting).toHaveText(message);
  }

  async expectError(message: string): Promise<void> {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(message);
    await this.expectLoginForm();
    await expect(this.page.getByRole('heading', { name: 'Mi cuenta', exact: true })).toBeHidden();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async expectLoginForm(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
    await expect(this.page.getByLabel('Correo electrónico', { exact: true })).toBeVisible();
    await expect(this.page.getByLabel('Contraseña', { exact: true })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Ingresar', exact: true })).toBeEnabled();
  }
}