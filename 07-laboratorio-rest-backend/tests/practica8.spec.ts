// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Escenario 2", () => {
  test("Punto 8 Test 1", async ({ request }) => {
    const response = await request.get("/api/no-existe");
    const body = await response.json();
    expect(response.status()).toBe(404);
    expect(body.error.code).toBe("ROUTE_NOT_FOUND");
    expect(body.error.message).not.toBe('');
    expect(response.headers()['x-request-id']).not.toBe('')
    expect(body.error.requestId).toEqual((response.headers()['x-request-id']))
  });

  test("Punto 8 Test 2", async ({ request }) => {
    const response = await request.head("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain("application/json");
    expect(await response.text()).toBe('');
  });
});
