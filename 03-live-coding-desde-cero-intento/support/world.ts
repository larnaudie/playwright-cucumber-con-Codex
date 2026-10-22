// Lo construiremos juntos: por ahora no hay World personalizado.
import {World,setWorldConstructor} from "@cucumber/cucumber";
import type { BrowserContext, Page } from "@playwright/test";

export class CustomWorld extends World {
    context?: BrowserContext;
    page?: Page;
    //currentPage? : Page;
    get currentPage(): Page{
        if(!this.page){
            throw new Error("No se ha inicializado la página");
        }
        return this.page;
    }
}

setWorldConstructor(CustomWorld);