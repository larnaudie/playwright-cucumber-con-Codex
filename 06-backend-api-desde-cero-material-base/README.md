# Backend con Playwright desde cero
API local de tareas + cliente visual para explorar peticiones.
La automatización de este proyecto usa Playwright Test y su fixture request.
No usa Cucumber, World ni Page Object Model: por ahora probamos HTTP directamente.
Después integraremos lo aprendido con Cucumber.

## Preparación — Git Bash
    npm ci
Terminal 1:
    npm run app
Abrir:
    http://127.0.0.1:3300

Terminal 2:
    npm run test:health
    npm run typecheck
    npm run report

No se necesita npm run browsers ni Chromium: estos tests no usan page.
La app se inicia manualmente para ver por separado servidor y cliente.
La configuración no inicia el backend automáticamente.
En PowerShell, usar npm.cmd si npm.ps1 está bloqueado.
Si todavía no existe package-lock.json, la primera instalación se hace con npm install.

## Primera actividad, sin programar
1. Iniciar el servidor.
2. Abrir la página y presionar Consultar salud.
3. Leer método GET, ruta /api/health, código 200 y body.
4. Abrir DevTools -> Network y localizar esa petición.
5. Ejecutar tests/00-health.spec.ts y comparar: hace la misma petición sin navegador.
No avanzar a POST hasta comprender ese intercambio.

## Material
- EMPEZAR-AQUI.md: fundamentos y primera clase.
- CONTRATO-API.md: comportamiento esperado.
- PRACTICO.md: ruta gradual y capturas.
- tests/00-health.spec.ts: único ejemplo resuelto.
- tests/01-tareas.spec.ts: espacio para tu código.

El servidor usa memoria. Reiniciarlo restaura una tarea inicial y elimina cambios.
No se fijan IDs en las pruebas: usar el ID recibido al crear cada recurso.
No hay autenticación todavía. Es un laboratorio local, no un backend de producción.
En la página, después de crear/modificar/eliminar, presionar Listar tareas para
actualizar la tabla; dejamos visible la respuesta original para estudiarla.