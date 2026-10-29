// Aquí construiremos los steps, primero para UN producto.
// Luego DataTable y después Scenario Outline.
// Usar CustomWorld y Page Object; no copiar toda la solución anterior.
import { expect } from "@playwright/test";
import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world";
import { environment } from "../config/environment";

Given("Estoy en la pagina de inicio", async function (this: CustomWorld) {
  await expect(this.carritoPage.getTituloPaginaTexto()).toBeVisible();
});

When(
  "Decido agregar {string} elementos del tipo {string}",
  async function (cantidad: number, producto: string) {
    await this.carritoPage.agregarCantidadDeProductos(cantidad, producto);
    await this.carritoPage.clickEnAgregarProducto(producto);
  },
);

When(
  "Recibiendo una tabla decido agregar elementos del tipo",
  async function (table: DataTable) {
    const filas = table.hashes();
    await this.page.pause();
    for (const fila of filas) {
      await this.carritoPage.agregarCantidadDeProductos(
        fila.cantidad,
        fila.producto,
      );
      await this.carritoPage.clickEnAgregarProducto(fila.producto);
    }
  },
);

When(
  "Verifico cantidad, subtotal y total",
  async function (table: DataTable) {
    const filas = table.hashes();
    await this.page.pause();
    for (const fila of filas) {
      await expect(await this.carritoPage.getObtenerTextoCantidadConProductoYCantidad(fila.cantidad,fila.producto)).toContainText(fila.cantidad)
      await expect(await this.carritoPage.obtenerTextoSubtotalPasandoSubtotalYProducto(fila.subtotal, fila.producto)).toContainText(fila.subtotal)
      await expect(await this.carritoPage.getTotalCarritoTexto()).toContainText(fila.total)
    }
  },
);

Then ('Verifico mensaje de error',async function(){
  await expect(this.carritoPage.getMensajeError()).toBeVisible();
})

Then("Verifico que el total sea {string}", async function (numero: string) {
  //await this.currentPage.pause();
  await expect(this.carritoPage.getTotalCarritoTexto()).toContainText(numero);
});

Then(
  "Verifico que el subtotal del producto {string} sea {string}",
  async function (producto: string, subtotal: string) {
    //await this.currentPage.pause();
    expect(
      await this.carritoPage.obtenerTextoSubtotalPasandoSubtotalYProducto(subtotal, producto),
    ).toContainText(subtotal);
  },
);

Then(
  "Verifico que el subtotal para un producto con una cantidad",
  async function (table: DataTable) {
    //await this.currentPage.pause();
    const filas = table.hashes();
    for (const fila of filas) {
      await expect(
        await this.carritoPage.obtenerTextoSubtotalPasandoSubtotalYProducto(
          fila.subtotal,
          fila.producto,
        ),
      ).toContainText(fila.subtotal);
    }
  },
);

Then(
  "Verifico el subtotal {string} para un producto {string} con una cantidad {string}",
  async function (subtotal: string, producto: string, cantidad:string) {
    //25 //Mouse //1
   // await this.currentPage.pause();
    await this.currentPage.mouse.wheel(0, 500);
    await expect(await this.carritoPage.getobtenerTextoSubtotalPasandoSubtotalYProducto(subtotal,producto)).toContainText(subtotal);
  },
);

Then(
  "Verifico datos invalidos para el subtotal {string} para un producto {string} con una cantidad {string}",
  async function (subtotal: string, producto: string, cantidad: string) {
    //await this.currentPage.pause();
    await this.currentPage.mouse.wheel(0, 500);
    expect(await this.carritoPage.getobtenerTextoSubtotalPasandoSubtotalYProducto(subtotal,producto)).not.toContainText(subtotal);
  },
);
