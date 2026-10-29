# Contrato API — versión 07
Base: http://127.0.0.1:3400.
Tareas públicas. Perfil y estadísticas protegidos.
Semántica documentada específica de este laboratorio.

## Recurso tarea
id: entero positivo generado, de solo lectura.
title: string trim, entre 3 y 80 caracteres.
completed: booleano, default false al crear.
priority: baja, media, alta; default media al crear.
title único globalmente, sin distinguir mayúsculas, tras trim.
Campos desconocidos o body null/array/escalar se rechazan.
ID no se puede enviar como campo editable.
Datos en memoria; seed inicial title "Explorar REST".
Reinicio restaura seed y reinicia IDs. No depender del seed en tests de escritura.

## Respuestas
Todas las respuestas API incluyen X-Request-Id y Cache-Control: no-store.
JSON excepto 204 y HEAD, que no tienen body.
Error: {"error":{"code":"CODIGO","message":"texto","requestId":"UUID"}}
Header X-Request-Id coincide con error.requestId.
Comparar códigos estables; requestId no se fija como literal esperado.
Hay Content-Type JSON también en 204: no implica existencia de body.

## Rutas principales
GET /api/health -> 200 {"status":"ok","service":"rest-lab-07"}.
HEAD /api/health -> 200 sin body.

GET /api/tasks -> 200 {"items":[],"total":N,"page":1,"limit":10}.
Filtros opcionales:
completed=true|false; priority=baja|media|alta; q=text.
page entero >=1 y limit entero 1..50; valores por defecto 1 y 10.
Filtros AND; q substring sin distinguir mayúsculas; orden de creación.
total es cantidad filtrada ANTES de paginar; página fuera de rango -> items [].
Query desconocida o valor inválido -> 400 INVALID_QUERY.
HEAD colección aplica mismos filtros y no devuelve body.

POST /api/tasks -> 201, Location /api/tasks/ID, body tarea.
Requiere title; completed y priority opcionales.
JSON inválido -> 400; Content-Type no JSON -> 415.
Reglas de campos -> 422; title duplicado -> 409.
Objeto data en Playwright se serializa automáticamente.

GET /api/tasks/ID -> 200 o 404 TASK_NOT_FOUND.
HEAD /api/tasks/ID -> mismo estado sin body.
PUT /api/tasks/ID -> 200. Debe tener title, completed, priority.
Reemplaza todos los campos editables, conserva id. No crea un ID inexistente.
PATCH /api/tasks/ID -> 200. Al menos un campo permitido; conserva los omitidos.
PUT/PATCH validan existencia ANTES de interpretar body.
Para ID existente: body/reglas inválidos no alteran el recurso.
DELETE /api/tasks/ID -> 204; repetir -> 404.
DELETE no requiere body ni Content-Type.

OPTIONS en rutas reconocidas -> 204 y Allow.
Métodos no permitidos -> 405 y Allow.
Ejemplo PUT /api/tasks -> 405; PUT /api/tasks/ID sí existe.
OPTIONS de una ruta de ID informa métodos aunque el recurso no exista.
ID sintácticamente inválido o ruta inexistente -> 404 ROUTE_NOT_FOUND.

## Autenticación didáctica
POST /api/sessions con JSON email/password -> 201.
qa@example.test (user) y admin@example.test (admin).
Password ficticia: Aprender123!
Campos ausentes/tipos inválidos -> 422.
Credenciales incorrectas -> 401 INVALID_CREDENTIALS.
Retorno: {accessToken,tokenType:"Bearer",expiresIn:1800,user:{email,role}}.
Tokens opacos guardados en memoria; no JWT.
Header para rutas protegidas: Authorization: Bearer TOKEN.
Sin token, inválido o vencido -> 401 UNAUTHORIZED y WWW-Authenticate: Bearer.
GET /api/profile -> 200 {email,role}.
GET /api/admin/stats -> admin 200 {taskCount}; user 403 FORBIDDEN.
DELETE /api/sessions invalida el token enviado -> 204; reuso -> 401.
Login no modifica permisos de tareas: esas rutas son públicas.
Las sesiones no tienen endpoint público para forzar expiración de reloj.

## Errores de contenido
400 INVALID_JSON: parseo del texto.
400 INVALID_QUERY: filtros/paginación.
409 TITLE_CONFLICT: title usado por otra tarea.
413 BODY_TOO_LARGE: más de 65536 bytes.
415 UNSUPPORTED_MEDIA_TYPE: POST/PUT/PATCH requieren application/json.
422 VALIDATION_ERROR: objeto/campos incumplen contrato.
500 INTERNAL_ERROR: excepción inesperada. No confundir con simulador 500.

## Endpoints de simulación — no recursos de negocio
GET /api/lab/status/429 -> 429 SIMULATED_429, Retry-After: 2.
GET /api/lab/status/500 -> 500 SIMULATED_500.
GET /api/lab/status/503 -> 503 SIMULATED_503, Retry-After: 2.
No existe rate limiter real ni una avería real detrás de esos endpoints.
GET /api/lab/delay?ms=1000 -> 200 {"delayedMs":1000}.
ms 0..2000 entero; default 500; fuera de rango -> 400 INVALID_QUERY.
Usar para practicar timeout de cliente, no como prueba de performance.

## Preparación y limpieza
POST propio por test, guardar su ID y DELETE en finally/fixture.
Crear títulos únicos (UUID). No depender de orden ni IDs de otro test.
No resetear todo el servidor para limpiar un test individual.
Otro contexto request no aísla la memoria del servidor.
No confundir comparar respuesta POST con comprobar persistencia por GET posterior.