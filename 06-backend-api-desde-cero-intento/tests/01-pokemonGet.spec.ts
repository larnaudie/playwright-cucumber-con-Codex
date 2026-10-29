// Aquí escribiremos tu primera prueba de GET /api/tasks.
// Después practicaremos POST, GET por ID, PATCH y DELETE.
// No hay solución preparada de esos ejercicios.
import { test, expect } from "@playwright/test";
const API_URL = process.env.API_URL;

test.describe("Comenzando con API",() => {
  test("Probando un Get", async ({ request }) => {
    const respuesta = await request.get(API_URL + "pokemon/ditto", {
      headers: { "Content-type": "application/json; charset=utf-8" },
    });
    console.log('Estado:', respuesta.status());
    const body = await respuesta.json();
    console.log('Body:', body);
    expect(respuesta.status()).toBe(200);
    expect(body.name).toBe('ditto');
  });
});
