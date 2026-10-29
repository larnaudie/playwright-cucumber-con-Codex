import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { AccountPage } from "../pages/AccountPage";

When(
  "hago click en el boton de cerrar sesion",
  async function (this: CustomWorld) {
    await this.accountPage.clickEnCerrarSesion();
  },
);

When(
  "hago click en el boton agregar en el {string} producto",
  async function (producto: string) {
    await this.accountPage.clickEnAgregarProducto(producto);
  },
);

Then(
  "veo el saludo {string}",
  async function (this: CustomWorld, message: string) {
    //const greeting = this.currentPage.getByRole('status');
    await expect(this.accountPage.getSaludo()).toBeVisible();
    await expect(this.accountPage.getSaludo()).toHaveText(message);
  },
);

Then("agrego los siguientes productos", async function (tabla:DataTable) {
  const filas = tabla.hashes();
  //for(let i = 0; i <= filas.length; i++){
  for(const fila of filas){
    await this.accountPage.clickEnAgregarProducto(fila.producto);
  }
});

Then("confirmo que el ultimo producto sea {string}",
  async function (producto: string) {
    await expect(await this.accountPage.getProductoAgregadoTexto(producto)).toBeVisible();
  },
);
