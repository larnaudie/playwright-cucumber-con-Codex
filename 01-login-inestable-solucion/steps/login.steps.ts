import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

Given('que abro el portal', async function (this: CustomWorld) {
  await this.login.open();
});
When('ingreso con el correo {string} y la contraseña {string}', async function (this: CustomWorld, email: string, password: string) {
  await this.login.login(email, password);
});
Then('veo el saludo {string}', async function (this: CustomWorld, message: string) {
  await this.login.expectGreeting(message);
});
Then('veo el error {string}', async function (this: CustomWorld, message: string) {
  await this.login.expectError(message);
});
When('cierro sesión', async function (this: CustomWorld) {
  await this.login.logout();
});
When('recargo la página', async function (this: CustomWorld) {
  await this.login.reload();
});
Then('veo el formulario de acceso', async function (this: CustomWorld) {
  await this.login.expectLoginForm();
});