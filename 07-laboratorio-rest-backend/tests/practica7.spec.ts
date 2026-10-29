// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Escenario 2", () => {
  test("Punto 7 Test 1", async ({ request }) => {
    const title = "Probando-delete-" + randomUUID();
    //Creo un elemento con post
    const response = await request.post("/api/tasks", {
      data: {
        title: title,
        completed: false,
        priority: "media",
      },
    });
    const body = await response.json();
    const id = body.id;
    expect(response.status()).toBe(201);

    //obtengo y valido el eleemnto creado
    const deleteResponse = await request.delete("/api/tasks/" + id);
    expect(deleteResponse.status()).toBe(204);
    //Tenemos que usar await sino da un error de promesa
    //.text() precisa await
    /**
     * text() lee el body de una respuesta y lo devuelve como un string, sin intentar interpretarlo como JSON.
     */
    expect(await deleteResponse.text()).toBe('')
    
    const deleteGetResponse = await request.get("/api/tasks/" + id);
    expect(deleteGetResponse.status()).toBe(404)
    const deleteGetResponseJSON = await deleteGetResponse.json();
    expect(deleteGetResponseJSON.error.code).toContain("TASK_NOT_FOUND")
  });

  test("Punto 6 Test 2", async ({ request }) => {
    const title = "Probando-delete-2-" + randomUUID();
    const response = await request.post("/api/tasks", {
      headers: {
        "Content-type": "application/json",
      },
      data: {
        title: title,
        completed: false,
        priority: "media",
      },
    });
    const bodyPOST = await response.json();
    const id = bodyPOST.id;
    expect(response.status()).toBe(201);

    const deleteResponseOk = await request.delete(`/api/tasks/${id}`);
    //falla por que mandamos un body vacio, esperamos un 422
    expect(deleteResponseOk.status()).toBe(204);
    expect(await deleteResponseOk.text()).toBe("");

    const deleteResponseFail = await request.delete(`/api/tasks/${id}`);
    const deleteResponseFailJson = await deleteResponseFail.json();
    expect(deleteResponseFail.status()).toBe(404);
    expect(deleteResponseFailJson.error.code).toContain("TASK_NOT_FOUND")

    const deleteGetResponse = await request.get("/api/tasks/" + id);
    const deleteGetResponseJSON = await deleteGetResponse.json();
    expect(deleteGetResponse.status()).toBe(404)
    expect(deleteGetResponseJSON.error.code).toContain("TASK_NOT_FOUND")

  });
});
