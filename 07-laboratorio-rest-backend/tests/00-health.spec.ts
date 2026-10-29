import { test, expect } from '@playwright/test';

test('el backend responde al contrato de salud', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const body = await response.json();
  expect(body).toEqual({ status: 'ok', service: 'rest-lab-07' });
  console.log('Respuesta:', response.status(), body);
});