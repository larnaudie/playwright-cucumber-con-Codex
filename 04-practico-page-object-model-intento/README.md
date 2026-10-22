# Práctico acompañado de Page Object Model

Punto de partida: dos escenarios implementados SIN POM.
Objetivo: refactorizarlos paso a paso y documentar cada decisión.
World, hooks y configuración están preparados porque aquí nos concentramos en POM.
pages/LoginPage.ts solo tiene comentarios. No hay solución final incluida.

## Preparación en PowerShell
Abrí una terminal en esta carpeta:
    npm.cmd ci
    npm.cmd run browsers

Terminal 1:
    npm.cmd run app

Si ya está ejecutándose esta misma app en http://127.0.0.1:3100, reutilizala.
No arranques otro servidor en el mismo puerto.

Terminal 2:
    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run test:parallel

Para mirar el navegador:
    $env:HEADED = '1'
    npm.cmd test
    Remove-Item Env:HEADED

Para explorar locators:
    npx.cmd playwright codegen http://127.0.0.1:3100

Reporte: reports/cucumber.html.
El reporte se sobrescribe en cada ejecución.
Datos ficticios: senior@example.test / Correcta123!

## Cómo trabajaremos
1. Primero ejecutar la base y capturar el resultado.
2. Seguir PRACTICO.md de a una etapa con ayuda en el chat.
3. Modificar pocas líneas, explicar el motivo y volver a ejecutar.
4. Registrar las capturas y resultados antes de pasar a la etapa siguiente.

## Alcance inicial
La app es la misma del login anterior, sin cambios.
Permite practicar constructor, locators, operaciones, aserciones, configuración,
World y transición a una segunda pantalla.
Componentes y locators de listas se practicarán en una ampliación posterior.

## Archivos
- app/: aplicación local.
- features/: comportamiento de los escenarios.
- steps/: implementación inicial directa.
- support/: ciclo de vida y recursos del escenario.
- config/: URL del entorno.
- pages/: espacio para los Page Objects.
- components/: reservado para una ampliación con reutilización real.
- capturas/: imágenes manuales para tu documento.
- PRACTICO.md: etapas y espacio para tus explicaciones.