// Construiremos el Page Object juntos, sin solución preparada.
// Pensar en: producto por nombre, cantidad, Agregar, fila del carrito,
// total, error, Eliminar y Vaciar carrito.
import { Locator, Page } from "@playwright/test";
import { environment } from "../config/environment"

export class CartPage {
    readonly page:Page;
    readonly mensajeError: Locator;
    readonly tituloPaginaTexto : Locator;
    readonly obtenerTextoCantidadConProductoYCantidad:(cantidad:string,producto:string) =>Locator;
    readonly campoAgregarProducto: (producto:string) => Locator;
    readonly botonAgregarProducto: (producto:string) => Locator;
    readonly botonEliminarProducto: (producto:string) => Locator;
    readonly totalCarritoTexto: Locator;
    readonly obtenerTextoSubtotalPasandoSubtotalYProducto:(subtotal:string, producto:string) => Locator;

    constructor(page:Page){
        this.page = page;
        this.mensajeError = this.page.getByText('No podés superar 5 unidades')
        this.campoAgregarProducto = (producto:string) => this.page.getByRole('spinbutton', { name:`Cantidad de ${producto}` });
        this.tituloPaginaTexto = this.page.getByRole('heading', { name: 'Tienda de práctica' })
        this.obtenerTextoCantidadConProductoYCantidad = (cantidad:string,producto:string) => this.page.getByRole('row').filter({hasText:`${producto}`}).getByRole('cell',{name:`${cantidad}`})     
        this.botonAgregarProducto = (producto) => this.page.getByRole('listitem').filter({ hasText: `${producto}` }).getByRole('button');
        this.botonEliminarProducto = (producto) => this.page.getByRole('row').filter({hasText:`${producto}`}).getByRole('button').filter({hasText:'Eliminar'});
        this.totalCarritoTexto = this.page.getByTestId('cart-total');
        this.obtenerTextoSubtotalPasandoSubtotalYProducto=(subtotal:string,producto:string)=> this.page.getByRole('row').filter({hasText:`${producto}`}).getByRole('cell').filter({hasText:`${subtotal}`}).last();
    }   

    //Getters
    getTituloPaginaTexto():Locator{
        return this.tituloPaginaTexto;
    }
    getTotalCarritoTexto(){
        return this.totalCarritoTexto;
    }
    getMensajeError(){
        return this.mensajeError;
    }
    async getObtenerTextoCantidadConProductoYCantidad(cantidad:string,producto:string){
        return this.obtenerTextoCantidadConProductoYCantidad(cantidad,producto);
    }
    async getobtenerTextoSubtotalPasandoSubtotalYProducto(subtotal:string,producto:string): Promise<Locator>{
        return this.obtenerTextoSubtotalPasandoSubtotalYProducto(subtotal,producto);
    }
    async getCampoAgregarProducto(producto:string): Promise<Locator>{
        return this.campoAgregarProducto(producto);
    }
    async getBotonAgregarProducto(producto:string): Promise<Locator>{
        return this.botonAgregarProducto(producto);
    }
    async getBotonEliminarProducto(producto:string): Promise<Locator>{
        return this.botonEliminarProducto(producto);
    }

    //Mwethods - Actions
    async clickEnAgregarProducto(producto:string){
        await this.botonAgregarProducto(producto).click();
    }
    async clickEnEliminarProducto(producto:string){
        await this.botonEliminarProducto(producto).click();
    }
    async agregarCantidadDeProductos(cantidad:string,producto:string){
        await this.campoAgregarProducto(producto).fill(cantidad);
    }

}