import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { environment } from '../config/environment';
//agrego la clase LoginPage
import { CustomWorld } from '../support/world';
//import {LoginPage} from '../pages/LoginPage'; -> Esto no se necesita en .steps.ts
import { HeaderPage } from '../pages/HeaderPage';

// BASE SIN POM: primero ejecutar; luego refactorizar de a una etapa.
Given('que abro el portal', async function (this: CustomWorld) {
  await this.loginPage.openLoginPage(environment.baseURL);
});

When(
  'ingreso con el correo {string} y la contraseña {string}',
  //async function (this: LoginPage, email: string, password: string) {
  async function (this: CustomWorld, email: string, password: string) {
    //await this.fillEmail(email);
    //await this.fillPassword(password);
    await this.loginPage.fillEmailAndPassword(email, password);
    await this.loginPage.clickLoginButton();
  }
);
Then('si recargo la pagina', async function(this:CustomWorld){
  await this.loginPage.reloadPage();
})

Then('veo la pagina del login', async function() {
  await expect(this.loginPage.getEmailInput()).toBeVisible();
  await expect(this.loginPage.getPasswordInput()).toBeVisible();
  await expect(this.loginPage.getLoginButton()).toBeVisible();
})

Then('veo el error {string}', async function (this: CustomWorld, message: string) {
  //const alert = this.currentPage.getByRole('alert');
  await expect(this.accountPage.getAlerta()).toBeVisible();
  await expect(this.accountPage.getAlerta()).toHaveText(message);
  await expect(this.loginPage.getLoginButton()).toBeVisible();
});

When('hago click en el boton ayuda', async function(this:CustomWorld){
  await this.headerPage.clickEnAyudaBoton()
})

When ('veo que se abre el portal de ayuda', async function(){
  await expect(this.headerPage.getTituloPortalAyuda()).toBeVisible()
})

Then ('hago click en cerrar ayuda', async function(this: CustomWorld){
  await this.headerPage.clickEnCerrarAyudaBoton();
})

Then ('se cierra el modal de portal de ayuda', async function(this: CustomWorld){
  await expect(this.headerPage.getTituloPortalAyuda()).not.toBeVisible();
})