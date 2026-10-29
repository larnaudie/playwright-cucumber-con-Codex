// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Escenario 2", () => {
  //Demostracion:
  test("PUT reemplaza los campos y conserva el ID", async ({ request }) => {
    let id: number | undefined;

    try {
      const created = await request.post("/api/tasks", {
        data: {
          title: "Antes-" + randomUUID(),
          completed: false,
          priority: "media",
        },
      });
      expect(created.status()).toBe(201);
      const original = await created.json();
      id = original.id;
      expect(Number.isInteger(id)).toBe(true);

      const replacement = {
        title: "Despues-" + randomUUID(),
        completed: true,
        priority: "alta",
      };

      const updated = await request.put("/api/tasks/" + id, {
        data: replacement,
      });
      expect(updated.status()).toBe(200);
      const updatedBody = await updated.json();
      expect(updatedBody).toEqual({ id, ...replacement });

      const read = await request.get("/api/tasks/" + id);
      expect(read.status()).toBe(200);
      const saved = await read.json();
      expect(saved).toEqual({ id, ...replacement });
    } finally {
      if (id !== undefined) {
        const cleanup = await request.delete("/api/tasks/" + id);
        expect([204, 404]).toContain(cleanup.status());
      }
    }
  });

  //Preparacion de un dato creado
  test("Punto 5 Test 1", async ({ request }) => {
    const title = "PUT-preparacion-titulo-unico-" + randomUUID();
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
    const body2 = await getResponse.json();

    const bodyJSON2 = JSON.stringify(body2);
    console.log("bodyJSON2: " + bodyJSON2);

    expect(body2.title).toBe(title);
    expect(body2.completed).toBe(false);
    expect(["media"]).toContain(body2.priority);

    //actualizo el elemento con put
    const title2 = "PUT-preparacion-titulo-unico-" + randomUUID();
    const getPutResponse = await request.put("/api/tasks/" + id, {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        title: title2,
        completed: true,
        priority: "alta",
      },
    });
    const getBodyOfPut = await getPutResponse.json();
    const getJSONBodyOfPut = JSON.stringify(getBodyOfPut);
    console.log("getUpdateJSON: " + getJSONBodyOfPut);

    //Obtengo de nuevo el mismo elemento para ver si se actualizó
    const getUpdate = await request.get("/api/tasks/" + id);
    const getBodyUpdate = await getUpdate.json();

    const getUpdateJSON = JSON.stringify(getBodyUpdate);
    console.log("getGETJSON: " + getUpdateJSON);

    expect(getBodyUpdate.title).toBe(title2);
    expect(getBodyUpdate.completed).toBe(true);
    expect(["alta"]).toContain(getBodyUpdate.priority);
  });
});
