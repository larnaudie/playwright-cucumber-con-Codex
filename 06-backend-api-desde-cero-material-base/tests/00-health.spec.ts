import { test, expect } from '@playwright/test';

// Ejemplo guiado mínimo: Playwright Test usa request, no una pestaña.
test('el backend está disponible', async ({ request }) => {
  const respuesta = await request.get('/api/health');

  console.log('Estado HTTP:', respuesta.status());
  console.log('Content-Type:', respuesta.headers()['content-type']);

  expect(respuesta.status()).toBe(200);

  const cuerpo = await respuesta.json();
  console.log('Body JSON:', cuerpo);

  expect(cuerpo).toEqual({
    status: 'ok',
    service: 'tareas-api',
  });
});