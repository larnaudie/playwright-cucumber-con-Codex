# Guía de la infraestructura

## Qué es World
Cucumber crea un World nuevo para cada escenario.
Es el objeto que comparten los steps y hooks de ESE escenario.
En esta solución contiene context y page, y hereda attach de World.
setWorldConstructor registra nuestra clase con Cucumber.
El getter login de la solución crea un pequeño Page Object alrededor de la misma page;
no crea otro navegador ni otra sesión.

La instancia World sola no aísla el navegador: el hook Before crea un BrowserContext nuevo.
Se usa function porque Cucumber enlaza this al World.
TypeScript this: CustomWorld es una anotación de tipo, no un argumento recibido en ejecución.

## Quién hace cada cosa
- Cucumber: descubre features, busca los steps, ejecuta hooks y produce el reporte.
- Playwright: controla el navegador y realiza las aserciones importadas desde @playwright/test.
- TypeScript: comprueba tipos con tsc. tsx permite cargar los archivos TS durante la ejecución.
- No usamos el runner Playwright Test. Su configuración de fixtures, trace o webServer
  no se activa automáticamente por importar expect.

## Ciclo de vida
BeforeAll -> browser por proceso worker.
Para cada escenario:
  World nuevo -> Before crea context y page -> steps -> After captura si falla -> cierra context.
AfterAll -> cierra browser.

## Captura y reporte: dos tareas distintas
page.screenshot() devuelve bytes PNG.
this.attach(bytes, 'image/png') asocia esos bytes al escenario de Cucumber.
format: ['progress', 'html:reports/cucumber.html']
activa salida de consola y el formatter HTML incluido en Cucumber.
El formatter convierte resultados y adjuntos en un HTML.
No instalamos un reporter adicional ni subimos imágenes a un servicio.
reports/ejemplo-fallo.html contiene una demostración.

## Trace Viewer, Codegen e Inspector
Trace Viewer abre una traza ya grabada:
    npx.cmd playwright show-trace ruta/al/trace.zip
Codegen permite explorar una página y elegir locators:
    npx.cmd playwright codegen http://127.0.0.1:3100
Ambos vienen con Playwright; no requieren un plugin de navegador separado.
Para Cucumber, generar trazas requiere usar context.tracing explícitamente:
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    // ... ejecutar acciones ...
    await context.tracing.stop({ path: 'reports/trace-UNICO.zip' });
Usar un nombre único por escenario/worker si se ejecuta en paralelo.
Esta solución implementa screenshots, no grabación de trazas.
Las trazas de context.tracing no incluyen las aserciones como Playwright Test.

## Para la entrevista
No conocemos las reglas de la empresa. Consultar antes si se permite documentación,
codegen, inspector, extensiones o instalación de dependencias.
Es útil poder escribir un locator con labels y roles sin herramientas.
Si solicitan crear un framework desde cero, conviene practicar un World mínimo,
hooks por escenario y registro de steps, entendiendo su propósito.
No memorizar toda esta solución: priorizar diagnóstico, await, locators,
aserciones reintentables y aislamiento.

Fuentes:
https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/world.md
https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md
https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/attachments.md
https://playwright.dev/docs/trace-viewer
https://playwright.dev/docs/codegen
https://playwright.dev/docs/api/class-tracing