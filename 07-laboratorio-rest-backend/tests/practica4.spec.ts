// Escribiremos aquí tus pruebas, de una lección a la vez.
// No hay soluciones CRUD implementadas. Usar la fixture request de Playwright Test.

import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Escenario 2", () => {
  //Demostracion:
  test("crear y leer una tarea propia", async ({ request }) => {
    const title = "POST-" + randomUUID();
    let id: number | undefined;

    try {
      const created = await request.post("/api/tasks", {
        data: { title, priority: "alta" },
      });
      expect(created.status()).toBe(201);
      const task = await created.json();
      id = task.id;

      expect(Number.isInteger(id)).toBe(true);
      expect(created.headers().location).toBe("/api/tasks/" + id);
      expect(task).toMatchObject({ title, completed: false, priority: "alta" });

      const read = await request.get("/api/tasks/" + id);
      expect(read.status()).toBe(200);
      expect(await read.json()).toEqual(task);
    } finally {
      if (id !== undefined) {
        const cleanup = await request.delete("/api/tasks/" + id);
        expect([204, 404]).toContain(cleanup.status());
      }
    }
  });

  test('Punto 4 Test 1', async({request})=>{
    const title = 'Hola-' +  randomUUID();
    const response = await request.post('/api/tasks',{
      data: {title : title}
    })
    const body = await response.json()
    const bodyJSON = JSON.stringify(body);
    console.log(bodyJSON)
    const id = body.id;
    expect(response.status()).toBe(201);
    expect(Number.isInteger(body.id)).toBe(true);
    expect(body.title).toContain(title);
    expect(body.completed).toBe(false);
    expect(["baja", "media", "alta"]).toContain(body.priority);

    const getResponse = await request.get(`/api/tasks/${id}`)
    expect(getResponse.status()).toBe(200)
  })

  test('Punto 4 Test 2', async({request})=>{
    const title = 'Hola' +  randomUUID();
    const response = await request.post('/api/tasks',{
      data: {title : ' ' + title + ' '}
    })
    const body = await response.json()
    const bodyJSON = JSON.stringify(body);
    console.log(bodyJSON)
    expect(body.title).toBe(title);
  })
});
