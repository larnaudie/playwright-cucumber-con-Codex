# Ejercicio 05 — Carrito con cantidades
Práctica acompañada para entrevista Senior QA Automation.
La aplicación ya está implementada. La automatización está sin resolver.
La app de este ejercicio no requiere login: nos concentramos en datos y comprobaciones.

## Arranque
En esta carpeta, Git Bash:
    npm ci
    npm run browsers
    npm run app

URL: http://127.0.0.1:3200 (puerto diferente al ejercicio anterior).
Otra terminal:
    npm run typecheck
    npm test -- features/carrito.feature

Hasta que escribas escenarios, Cucumber encontrará cero escenarios:
eso NO demuestra que el ejercicio funcione ni esté terminado.
Para ver el navegador:
    HEADED=1 npm test -- features/carrito.feature

## Infraestructura
Se copiaron dependencias/configuración base y hooks de aislamiento y evidencia.
World está preparado solo con context, page y currentPage.
La integración de CartPage en World la harás vos; hooks todavía no la inicializan.
CartPage, steps y feature tienen solo comentarios y estructura inicial.
No hay soluciones de automatización incluidas.
Leé CONSIGNA.md para reglas y etapas.