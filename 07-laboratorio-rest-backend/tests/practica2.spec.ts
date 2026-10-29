// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { stringify } from "querystring";
test.describe("Escenario 2", () => {
  //Demostracion:
  test("consultar pendientes", async ({ request }) => {
    const response = await request.get("/api/tasks", {
      params: { completed: "false" },
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const bodyJSON = stringify(body);
    console.log("Body Demo: " + bodyJSON);
    expect(Array.isArray(body.items)).toBe(true);
    for (const task of body.items) {
      expect(task.completed).toBe(false);
    }
  });

  //Punto 2
  test("Punto 2 - Test 1", async ({ request }) => {
    const response = await request.get("/api/tasks", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);

    const body = await response.json(); //devuelve un objeto JSON
    const bodyJSON: string = JSON.stringify(body.items); //pasamos a string JSON para verlo en consola
    console.log("Body Test 1: " + bodyJSON); // es el body en formato string!!
     expect(Array.isArray(body.items)).toBe(true);
  });

  test("Punto 2 - Test 2", async ({ request }) => {
    const response = await request.get("/api/tasks", {
      params: { completed: "false" }, //Esto es un Filtro
      headers: { Accept: "application/json" },
    });
    const body = await response.json(); //devuelve un objeto JSON
    const bodyJSON: string = JSON.stringify(body.items); //pasamos a string JSON para verlo en consola
    console.log("Body Test 1: " + bodyJSON); // es el body en formato string!!
    for (const item of body.items) {
      expect(item.completed).toBe(false);
    }
    expect(response.status()).toBe(200);
  });

  test("Punto 2 - Test 3", async ({ request }) => {
    const response = await request.get("/api/tasks", {
      params: { completed: "pendiente" },
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    const bodyJSON: string = JSON.stringify(body.error); //pasamos a string JSON para verlo en consola
    console.log("Body Test 1: " + bodyJSON); // es el body en formato string!!
    expect(body.error.code).toBe("INVALID_QUERY");
  });
});
