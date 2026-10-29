# Primera clase — qué es backend
El frontend es la interfaz con la que interactúa una persona.
El backend recibe peticiones, aplica reglas y devuelve respuestas.
Una API es el contrato mediante el cual un cliente se comunica con ese backend.
El cliente puede ser un navegador, Postman o Playwright. No hace falta abrir la UI.

## Un intercambio real de nuestra app
Cliente envía:
GET http://127.0.0.1:3300/api/health
Header Accept: application/json
Sin body.

Servidor responde:
Estado HTTP: 200
Header Content-Type: application/json; charset=utf-8
Body: {"status":"ok","service":"tareas-api"}

- URL: dirección. 127.0.0.1 es tu equipo; 3300 es el puerto.
- /api/health es la ruta.
- GET expresa que consultamos un recurso.
- Header es metadato de la petición o respuesta.
- Body es el contenido; aquí la respuesta usa JSON.
- 200 indica éxito HTTP. El campo status:"ok" es un dato propio de nuestra API.
No confundir ese campo con el estado HTTP.
JSON no es exactamente un objeto JavaScript: es un formato de texto.
response.json() interpreta ese texto y devuelve datos utilizables en JavaScript.

## Cómo leer el ejemplo
test(...) define una prueba de Playwright Test.
async ({ request }) recibe la fixture request preparada por el runner.
request no es Page: realiza peticiones HTTP.
await request.get(...) espera la respuesta.
response.status() devuelve el número del estado.
await response.json() obtiene el cuerpo interpretado.
expect(...).toBe y toEqual comprueban valores; no necesitan await.

## Qué probar además de un estado
Un 200 no demuestra por sí solo que el recurso tenga datos correctos.
Podemos verificar headers, campos, tipos y reglas.
En POST y PATCH también consultaremos después para comprobar el estado del servidor.
Un DELETE exitoso se comprobará intentando recuperar el recurso.
204 no tiene body: no llamar response.json() sobre una respuesta vacía.

## Métodos que aprenderemos
GET consultar.
POST crear.
PATCH actualizar algunos campos.
DELETE eliminar.
PUT, autenticación y contratos avanzados se practicarán después.
No asumir que toda API usa exactamente los códigos de este laboratorio:
los tests deben basarse en su contrato.

Fuente oficial:
https://playwright.dev/docs/api-testing
https://playwright.dev/docs/api/class-apirequestcontext