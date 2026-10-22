// ETAPA 1: construir juntos. No hay solución implementada.
// 1. Importar los tipos Page y Locator.
// 2. Exportar la clase LoginPage.
// 3. Declarar los locators de correo, contraseña y botón.
// 4. Recibir Page en el constructor y definir los locators.
// El constructor no navega ni hace acciones.

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;



  constructor(page: Page) {
    this.page = page;
    this.emailInput = this.page.locator('#email');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.getByRole('button', { name: 'Ingresar' });

  }
  //Gets de selectores
   getEmailInput(): Locator {
    return this.emailInput;
  }

  getPasswordInput(): Locator {
    return this.passwordInput;
  }

   getLoginButton(): Locator {
    return this.loginButton;
  }

  async openLoginPage(url: string){
    await this.page.goto(url);
  }

  //Como no me gusta que los locators sean accesibles desde step, vamos a hacer asi:
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillEmailAndPassword(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async reloadPage() {
    await this.page.reload();
  }
}