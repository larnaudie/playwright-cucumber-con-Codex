// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { stringify } from "querystring";
import { page } from '../../01-login-inestable-material-base/support/hooks';
test.describe("Escenario 2", () => {
  //Demostracion:
  test("estructura de colección", async ({ request }) => {
    const response = await request.get("/api/tasks");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    const body = await response.json();

    expect(Array.isArray(body.items)).toBe(true);
    expect(Number.isInteger(body.total)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(0);
    expect(body.items.length).toBeLessThanOrEqual(body.limit);
    expect(body.items.length).toBeLessThanOrEqual(body.total);

    for (const task of body.items) {
      expect(Number.isInteger(task.id)).toBe(true);
      expect(task.id).toBeGreaterThan(0);
      expect(typeof task.title).toBe("string");
      expect(typeof task.completed).toBe("boolean");
      expect(["baja", "media", "alta"]).toContain(task.priority);
    }
  });

  //Punto 2
  test("Punto 3 - Test 1", async ({ request }) => {
    //el accept:application/json esta en playwright.config,ts
    const response = await request.get("/api/tasks");
    expect(response.status()).toBe(200);
    const body = await response.json(); //devuelve un objeto JSON
    const bodyJSON: string = JSON.stringify(body); //pasamos a string JSON para verlo en consola
    console.log("Body Test 1: " + bodyJSON); // es el body en formato string!!
    
    
    expect(Array.isArray(body.items)).toBe(true);
    expect(Number.isInteger(body.total)).toBe(true);
    expect(body.page).toBeGreaterThanOrEqual(1);
    expect(body.page).toBeLessThan(50);
    expect(body.page).toBeGreaterThan(0);
    for(const item of body.items){
      expect(Number.isInteger(item.id)).toBe(true);
      expect(item.id).toBeGreaterThan(0);
      expect(typeof item.title).toBe("string");
      expect(typeof item.completed).toBe("boolean");
      expect(["baja", "media", "alta"]).toContain(item.priority);
    }

  });

});
