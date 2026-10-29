import { World, setWorldConstructor } from "@cucumber/cucumber";
import type { BrowserContext, Page } from "@playwright/test";
import { CartPage } from "../pages/CartPage";

export class CustomWorld extends World {
  context?: BrowserContext;
  page?: Page;

  private _carritoPage?: CartPage;

  inicializatePage() {
    this._carritoPage = new CartPage(this.currentPage);
  }

  get currentPage(): Page {
    if (!this.page) throw new Error("Before no inicializó la página");
    return this.page;
  }

  get carritoPage(){
    if(!this._carritoPage){
      throw new Error ('Before no inicializo a carritoPage')
    }
    return this._carritoPage;
  }
  
}
setWorldConstructor(CustomWorld);
