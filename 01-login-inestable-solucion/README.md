# Solución comentada — Desafío 01
Tu carpeta original no fue modificada. Esta es una suite independiente.
Leé DECISIONES.md y después compará support/hooks.ts, pages/LoginPage.ts y los steps.

## Ejecutar en PowerShell
Desde esta carpeta:
    npm.cmd ci
    npm.cmd run browsers

Terminal 1:
    npm.cmd run app

Terminal 2:
    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run test:parallel

Si la app original ya está ejecutándose en el puerto 3100, reutilizala.
No levantes dos servidores en el mismo puerto.
Abrí reports/cucumber.html después de ejecutar.
El reporte se sobrescribe en cada ejecución.

Para diez ejecuciones paralelas:
    1..10 | ForEach-Object { npm.cmd run test:parallel; if ($LASTEXITCODE -ne 0) { throw "Falló la ejecución $_" } }

## Verificar la evidencia
Cambiá temporalmente el saludo esperado de un escenario por un texto incorrecto.
Ejecutá npm.cmd test y abrí reports/cucumber.html.
El escenario fallido debe incluir una imagen. Revertí luego el cambio.
Una captura de un fallo puede ser útil aunque el fallo haya ocurrido antes de cargar la app.

## Lecturas oficiales
https://playwright.dev/docs/test-assertions
https://playwright.dev/docs/browser-contexts
https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md
https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/attachments.md
Si usás el navegador descargado durante la verificación en esta carpeta:
    $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.browsers'
    npm.cmd test
