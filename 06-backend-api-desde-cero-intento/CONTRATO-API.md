# Contrato de la API de tareas
Base URL: http://127.0.0.1:3300
Todas las respuestas de API usan JSON salvo DELETE 204.
Los cuerpos de POST/PATCH requieren Content-Type: application/json.
No hay autenticación ni base de datos externa. Datos en memoria de un proceso.

## Recurso Task
id: entero generado por el servidor (no enviarlo).
title: string, 3 a 80 caracteres tras quitar espacios extremos.
completed: booleano, por defecto false.
priority: "baja", "media" o "alta", por defecto "media".
No se aceptan campos desconocidos ni un body que no sea objeto.

## Endpoints
GET /api/health -> 200
{"status":"ok","service":"tareas-api"}

GET /api/tasks -> 200
{"items":[...],"total":cantidad de resultados}
Orden de creación ascendente. Sin paginación en esta versión.
GET /api/tasks?completed=true o false filtra.
Otro valor de completed -> 400, error.code INVALID_QUERY.
Los query params no documentados se ignoran.

POST /api/tasks -> 201 y header Location: /api/tasks/ID
Body mínimo: {"title":"Aprender GET"}
Respuesta: el recurso creado con ID y defaults.
Títulos duplicados se permiten. Las reglas no exigen 409.

GET /api/tasks/ID -> 200 con recurso o 404 TASK_NOT_FOUND.

PATCH /api/tasks/ID -> 200 con recurso actualizado.
Ejemplo: {"completed":true}
Debe contener al menos un campo permitido. No borra los demás campos.
Body inválido -> 400 VALIDATION_ERROR. ID inexistente -> 404 TASK_NOT_FOUND.
La API comprueba existencia del ID antes de leer/validar el body.

DELETE /api/tasks/ID -> 204 sin body.
Segundo DELETE del mismo ID -> 404 TASK_NOT_FOUND.
No llamar response.json() cuando el status sea 204.

## Errores
Estructura: {"error":{"code":"CODIGO","message":"Explicación"}}
400 VALIDATION_ERROR: incumplimiento de campos.
400 INVALID_JSON: body JSON roto.
400 INVALID_QUERY: filtro inválido.
404 TASK_NOT_FOUND: ID numérico positivo inexistente.
404 ROUTE_NOT_FOUND: ruta desconocida, incluido ID mal formado.
405 METHOD_NOT_ALLOWED y header Allow: método no soportado en ruta conocida.
415 UNSUPPORTED_MEDIA_TYPE: POST/PATCH sin Content-Type JSON.
413 BODY_TOO_LARGE: body mayor que 64 KiB.
500 INTERNAL_ERROR: fallo inesperado; no es un caso que debamos forzar ahora.

## Aislamiento
request ofrece un cliente por test, pero NO restaura la memoria del servidor.
Cada test con escrituras crea sus propios datos y los limpia con DELETE.
No depender de IDs fijos, títulos únicos globales ni total global igual a 1.
No hay endpoint de reset global porque podría romper otros escenarios.
Reiniciar el servidor borra todos los datos del laboratorio.