# Práctica guiada para mañana — 35 a 45 minutos
Este ejercicio refuerza el primero. No introduce una aplicación nueva.
World, hooks y reporte están preparados. Solo completá steps/login.steps.ts
y después agregá un escenario de logout en features/login.feature.
No necesitás Page Objects en esta práctica.

## Preparación
En esta carpeta:
    npm.cmd ci

Para reutilizar Chromium ya descargado en la solución (PowerShell):
    $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Split-Path $PWD) '01-login-inestable-solucion\.browsers'

Si ese navegador no está disponible:
    npm.cmd run browsers
En ese caso quitá la variable anterior o instalá con ella configurada.

Terminal 1:
    npm.cmd run app
Si ya está funcionando en el puerto 3100, reutilizá ese servidor.

## Primero: explorar (5 minutos)
    npx.cmd playwright codegen http://127.0.0.1:3100
Usá Pick Locator para explorar los campos y botones.
No copies una prueba completa: elegí locators y explicá por qué son apropiados.
Alternativa sin codegen: inspeccionar el HTML con DevTools.

## Después: completar (20 minutos)
Implementá los tres TODO. No cambies hooks, World ni la aplicación.
Usá getByLabel/getByRole, await y expect(locator).
No uses sleeps ni retries.
El import expect está listo para tus aserciones.
Al comienzo los escenarios deben fallar con un error TODO: es intencional.

    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run test:parallel

## Luego: ampliar (10 minutos)
Agregá logout. Verificá que vuelve el formulario y que, al recargar,
la sesión no reaparece. Cada escenario comienza con su propio contexto.

## Finalmente: evidencia (5 minutos)
Cambiá temporalmente un texto esperado por otro incorrecto.
Ejecutá la suite y abrí reports/cucumber.html.
Confirmá que el fallo contiene una imagen. Revertí el cambio.

## Entrega y explicación
Creá NOTAS.md con:
- Qué localizadores elegiste y por qué.
- Por qué toHaveText funciona mejor aquí que textContent + toBe.
- Para qué sirve el contexto nuevo por escenario.
- Comandos ejecutados y resultados.

No leas la solución mientras lo intentás. Si te trabás, pedí una pista.
No hace falta saber escribir el framework de memoria para empezar esta práctica.