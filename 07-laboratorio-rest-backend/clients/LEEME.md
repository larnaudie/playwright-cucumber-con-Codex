# Clientes API
Al principio escribimos request.get/post/put/patch/delete directamente en el test.
Después extraeremos TasksClient para compartir rutas y operaciones.
Recibirá APIRequestContext por constructor, no Page, World ni locators.
Los tests conservarán expectativas explícitas. El cliente no asumirá que toda
respuesta es exitosa: necesitamos probar rechazos y leer su status/body.
No hay que convertir cada línea en una clase para hacer un framework.