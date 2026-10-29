# Laboratorio REST 07
Empezar por PRACTICO-BACKEND-REST.md. Contiene 16 módulos con teoría y práctica guiada.
Continuar con RUTA-FRAMEWORK-API-SENIOR.md: módulos 17–26 para construir el framework.
La configuración se introduce desde el inicio y se profundiza gradualmente.
Este laboratorio es independiente del 06: usa puerto 3400, defaults y errores distintos.

## Git Bash
    npm ci
    npm run app

Abrir http://127.0.0.1:3400.
En otra terminal:
    npm run test:health
    npm run typecheck
    npm run report

No se necesitan navegadores instalados para tests de API.
No hay Cucumber ni World en este proyecto.
Servidor manual. Reiniciar elimina tareas/sesiones de memoria.
Se incluye SOLO health resuelto; los ejercicios se construyen con el tutor.

## App
Elegir plantilla, editar método/ruta/headers/body y Enviar.
La consola permite mandar JSON roto y tipos de contenido incorrectos a propósito.
Plantillas con ID 1 requieren cambiarlo por el ID creado cuando corresponda.
Si creás una sesión, el token se copia al campo local; usar el botón de Authorization.
Cambiar plantilla restablece headers: volver a aplicar el token para rutas protegidas.
La UI es cliente de exploración; no automatizarla al estudiar API.

## Postman
Importar postman/Laboratorio-REST.postman_collection.json.
Variables de colección baseUrl, taskId y token.
Solo el test de salud viene resuelto. Agregar scripts según cada módulo.
Las credenciales son ficticias. No exportar tokens reales ni publicar secretos.

## Archivos
CONTRATO-API.md: referencia del comportamiento de ESTA aplicación.
PRACTICO-BACKEND-REST.md: teoría, ejemplos, tareas y preguntas.
tests/: automatización de Playwright Test.
clients/, fixtures/, schemas/, data/: espacios para evoluciones posteriores.
capturas/: evidencia de aprendizaje.
No crear abstracciones hasta comprender las peticiones directas.

## Alcance y límites
Tareas públicas; perfil/estadísticas protegidos para estudiar 401/403.
No hay multiusuario de tareas, base de datos, JWT ni seguridad de producción.
429/500/503 y delay bajo /api/lab son SIMULADORES, no funcionalidades productivas.
El contrato REST no garantiza por sí solo robustez, seguridad ni rendimiento.