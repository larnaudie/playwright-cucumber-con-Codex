import { Page } from "@playwright/test";
import { environment } from "../config/environment";


export class CarritoPage {
  private readonly page: Page;
  
  constructor(page:Page){
    this.page = page;
  }

}