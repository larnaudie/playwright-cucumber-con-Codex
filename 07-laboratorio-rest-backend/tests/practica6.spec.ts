// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Escenario 2", () => {
  test("Punto 6 Test 1", async ({ request }) => {
    const title = "PATCH-preparacion-titulo-" + randomUUID();
    //Creo un elemento con post
    const response = await request.post("/api/tasks", {
      data: {
        title: title,
        completed: false,
        priority: "media",
      },
    });
    const body = await response.json();
    const bodyJSON = JSON.stringify(body);
    console.log(bodyJSON);
    const id = body.id;
    expect(response.status()).toBe(201);

    //obtengo y valido el eleemnto creado
    const getResponse = await request.get("/api/tasks/" + id);
    expect(getResponse.status()).toBe(200);
    const body2 = await getResponse.json(); //lo paso a OBJETO json

    //ESTAS 2 lineas la hacemos para debuguear y ver lo que hizo
    const bodyJSON2 = JSON.stringify(body2); //lo paso a STRING formato JSON
    console.log("bodyJSON2: " + bodyJSON2);

    expect(body2.title).toBe(title);
    expect(body2.completed).toBe(false);
    expect(["media"]).toContain(body2.priority); //USO EL OBJETO JSON body2

    //actualizo el elemento con put
    const patchResponse = await request.patch("/api/tasks/" + id, {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        priority: "alta",
      },
    });
    expect(patchResponse.status()).toBe(200);
    //Obtengo de nuevo el mismo elemento para ver si se actualizó
    const getUpdate = await request.get("/api/tasks/" + id);
    const getBodyUpdate = await getUpdate.json();
    
    expect(getUpdate.status()).toBe(200);
    expect(getBodyUpdate.id).toBe(id);
    expect(getBodyUpdate.title).toBe(title);
    expect(getBodyUpdate.completed).toBe(false);
    expect(["alta"]).toContain(getBodyUpdate.priority);
    //Podemos testear el body entero y no por partes
    //...body se le llama destructuring, y coloca todas las 
    //propiedades del body
    expect(getBodyUpdate).toEqual({...body, priority:'alta'})
  });

  test("Punto 6 Test 2", async ({ request }) => {
    const title = "Rechazamos patch vacio-" + randomUUID();
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

    const patchResponse = await request.patch(`/api/tasks/${id}`, {
      headers: {
        "Content-type": "application/json",
      },
      data: {},
    });
    //falla por que mandamos un body vacio, esperamos un 422
    expect(patchResponse.status()).toBe(422);
    const bodyPatch = await patchResponse.json();
    expect(bodyPatch.error.code).toContain("VALIDATION_ERROR");

    const GETResponse = await request.get(`/api/tasks/${id}`);
    const bodyGet = await GETResponse.json();
    expect(GETResponse.status()).toBe(200);
    //testeamos el body del get y del post
    expect(bodyGet).toEqual(bodyPOST);
    //tambien podemos validar asi, colocamos todas las propiedades
    expect(bodyGet).toEqual({
      id,
      title,
      completed: false,
      priority: "media",
    });
  });

  test("Punto 6 Test 3", async ({ request }) => {
    const title = "Test 3-" + randomUUID();
    const response = await request.post("/api/tasks", {
      headers: {
        "Content-type": "application/json",
      },
      data: {
        title: title,
        priority: "media",
        completed: false,
      },
    });
    expect(response.status()).toBe(201);
    const bodyPOST = await response.json();
    const id = bodyPOST.id;

    const patchResponse = await request.patch(`/api/tasks/${id}`, {
      headers: {
        "Content-type": "application/json",
      },
      data: {
        completed: "true",
      },
    });
    //falla por que true deberia ser booleano, entonces espreamos un 422
    expect(patchResponse.status()).toBe(422);
    const bodyPatch = await patchResponse.json();
    expect(bodyPatch.error.code).toContain("VALIDATION_ERROR");

    const GETResponse = await request.get(`/api/tasks/${id}`);
    const bodyGet = await GETResponse.json();
    expect(GETResponse.status()).toBe(200);
    //Validamos el body del get con el del post
    expect(bodyGet).toEqual(bodyPOST);
    //tambien podemos validar asi, colocamos todas las propiedades
    expect(bodyGet).toEqual({
      id,
      title,
      completed: false,
      priority: "media",
    });
  });
});
