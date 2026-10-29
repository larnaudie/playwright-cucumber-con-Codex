import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import { HeaderPage} from '../pages/HeaderPage'

export class CustomWorld extends World {
  context?: BrowserContext;
  page?: Page;

  get currentPage(): Page {
    if (!this.page) {
      throw new Error('Before no inicializó la página');
    }
    return this.page;
  }

  /* Alternativa 1.
  get loginPage(): LoginPage {
    if (!this.page) {
      throw new Error('Before no inicializó la página');
    }
    return new LoginPage(this.page);
  }
  */

  //Alternativa 2
  private _loginPage?: LoginPage;
  private _accountPage?: AccountPage;
  private _headerPage?: HeaderPage;
  //private _homePage?: HomePage;
  //private _headerPage?: HeaderPage;

  initializePages(): void {
    this._loginPage = new LoginPage(this.currentPage);
    this._accountPage = new AccountPage(this.currentPage);
    this._headerPage = new HeaderPage(this.currentPage);
    //this.homePage = new HomePage(this.currentPage);
    //this.headerPage = new HeaderPage(this.currentPage);
    //this..... 
  }

  get headerPage() : HeaderPage{
    if(!this._headerPage){
      throw new Error('Before no pudo incializar HeaderPAge')
    }
    return this._headerPage;
  }

  get loginPage(): LoginPage {
    if (!this._loginPage) {
      throw new Error('Before no inicializó LoginPage');
    }

    return this._loginPage;
  }

  get accountPage(): AccountPage {
    if (!this._accountPage) {
      throw new Error('Before no inicializó AccountPage');
    }

    return this._accountPage;
  }

}

setWorldConstructor(CustomWorld);