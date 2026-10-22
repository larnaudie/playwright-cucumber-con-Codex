# Live coding acompañado — desde cero

Objetivo: construir y entender una integración mínima de Cucumber, TypeScript y Playwright.
La aplicación y la configuración están listas. World, hooks y steps NO están implementados:
sus archivos contienen únicamente comentarios, para que sepas dónde vamos a trabajar.
No hay una solución incluida ni un Page Object preparado.

No es necesario terminar todo en una sesión. Vamos por etapas; escribís vos y revisamos juntos.

## Preparación en PowerShell
Desde esta carpeta:
    npm.cmd ci
    npm.cmd run browsers

Terminal 1:
    npm.cmd run app

Dejá el servidor abierto. Si ya hay una instancia de esta app en el puerto 3100,
reutilizala en lugar de arrancar otra.

Terminal 2:
    npm.cmd test

Al principio Cucumber mostrará steps undefined: es el resultado esperado.
El typecheck cobra sentido cuando agreguemos código; no hay implementación TS inicial.

## Ruta de la práctica
1. Leer el escenario y explicar qué queremos comprobar.
2. Construir support/world.ts: guardar recursos por escenario y registrar la clase.
3. Construir support/hooks.ts: abrir navegador, crear contexto/página por escenario y limpiar.
4. Implementar Given: navegar a http://127.0.0.1:3100.
5. Implementar When: completar campos y enviar.
6. Implementar Then: comprobar un saludo visible con el texto esperado.
7. Agregar el escenario de credenciales incorrectas y comprobar aislamiento.
8. Ejecutar secuencial y con dos workers.
9. Agregar captura ante fallos y reporte HTML, entendiendo cada línea.
10. Agregar logout como práctica con menos ayuda.

No copies la solución anterior. Si algo no sale, lo construimos en el chat con pistas.
En cada etapa vamos a explicar qué escribimos, ejecutar y leer el resultado.

## Comandos que iremos usando
    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run test:parallel

Para explorar locators, opcional:
    npx.cmd playwright codegen http://127.0.0.1:3100

## Datos ficticios de la aplicación
Correo válido: senior@example.test
Contraseña válida: Correcta123!
Saludo esperado: Bienvenido, Alex
Mensaje de rechazo: Credenciales incorrectas

## Primera etapa
Antes de escribir código, respondé:
¿Qué recursos del navegador queremos compartir entre los steps de UN escenario?
Después implementaremos el World mínimo juntos.

## Qué iremos evaluando
- Entender el código y poder explicarlo.
- Manejar await y leer errores.
- Elegir locators con significado.
- Esperar condiciones observables.
- Aislar los escenarios y cerrar recursos.
- Usar evidencia para diagnosticar.
La velocidad no es el objetivo de esta primera práctica.