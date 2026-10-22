// ETAPA 1: construir juntos. No hay solución implementada.
// 1. Importar los tipos Page y Locator.
// 2. Exportar la clase LoginPage.
// 3. Declarar los locators de correo, contraseña y botón.
// 4. Recibir Page en el constructor y definir los locators.
// El constructor no navega ni hace acciones.

import { Page, Locator } from '@playwright/test';

export class HeaderPage {
  private readonly page: Page;
  private readonly ayudaBoton : Locator;
  private readonly cerrarAyudaBoton : Locator;
  private readonly tituloPortalAyuda:Locator;


  constructor(page: Page) {
    this.page = page;
    this.ayudaBoton = this.page.getByRole('button', {name:'Ayuda'})
    this.cerrarAyudaBoton = this.page.getByRole('button', {name:'Cerrar Ayuda'})
    this.tituloPortalAyuda = this.page.getByRole('heading', {name:'Ayuda del portal'})

  }
    //Gets de selectores
    getTituloPortalAyuda(){
      return this.tituloPortalAyuda;
    }

   getAyudaBoton(){
    return this.ayudaBoton;
   }
   getCerrarAyudaBoton(){
    return this.cerrarAyudaBoton;
   }

   async clickEnAyudaBoton(){
    await this.ayudaBoton.click()
   }
   async clickEnCerrarAyudaBoton(){
    await this.cerrarAyudaBoton.click();
   }
}