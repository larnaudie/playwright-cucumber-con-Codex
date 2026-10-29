import { environment, timeoutExtended } from "../config/environment";
import { Page } from "@playwright/test";
import { Locator } from "@playwright/test";

export class AccountPage {
  private readonly page: Page;
  private readonly tituloPagina: Locator;
  private readonly saludo: Locator;
  private readonly alerta: Locator;
  private readonly cerrarSesion: Locator;
  //Este locator tiene |Nombre| : ( parametro y tipo) | arrow function y Locator
  private readonly agregarProductoBoton : (producto: string) => Locator;
  private readonly productoAgregado: (producot: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.tituloPagina = this.page.getByRole("heading", {
      name: "Portal de clientes",
    });
    this.saludo = this.page.getByRole("status");
    this.alerta = this.page.getByRole("alert");

    this.cerrarSesion = this.page.getByRole("button", {
      name: "Cerrar sesión",
    });

    this.agregarProductoBoton = (producto:string) => this.page.getByRole("listitem")
        .filter({ hasText: `${producto}` }).getByRole('button');

    this.productoAgregado = (producto: string) =>
      this.page.getByTestId("cart-summary").filter({ hasText: `${producto}` });
  }

  //Locators get
  getTituloPagina(): Locator {
    return this.tituloPagina;
  }

  getSaludo(): Locator {
    return this.saludo;
  }

  getAlerta(): Locator {
    return this.alerta;
  }

  getCerrarSesion(): Locator {
    return this.cerrarSesion;
  }

  async getAgregarProductoTexto(nombre: string): Promise<Locator> {
    return this.agregarProductoBoton(nombre);
  }

  async getProductoAgregadoTexto(nombre: string): Promise<Locator>{
    return this.productoAgregado(nombre);
  }

  //---------------------------  Methods ---------------------
  async clickEnAgregarProducto(nombre: string) {
    await this.agregarProductoBoton(nombre).click();
  }

  async clickEnCerrarSesion() {
    //await this.cerrarSesion.waitFor({state:'visible', timeout: timeoutExtended});
    await this.cerrarSesion.click();
  }

}
