# Carrito con cantidades — Consigna

## Situación
Una tienda permite agregar productos al carrito. Tenés que diseñar pruebas
que detecten cantidades, subtotales o totales incorrectos.
No alcanza con comprobar que el producto del catálogo esté visible.

## Reglas del producto
- Mouse: USD 25; Teclado: USD 80; Monitor: USD 200.
- No hay impuestos, descuentos ni envío. Los importes son enteros.
- La cantidad de una operación debe ser un entero entre 1 y 5.
- Vacío, 0, negativos, decimales y valores mayores que 5 son inválidos.
- Error de cantidad: "La cantidad debe ser un entero entre 1 y 5".
- Agregar el mismo producto acumula sus cantidades en UNA fila.
- Máximo acumulado: 5 unidades por producto.
- Exceder ese máximo muestra "No podés superar 5 unidades por producto".
- Una operación rechazada no cambia filas ni total.
- Subtotal: precio unitario por cantidad. Total: suma de subtotales.
- Eliminar borra la fila completa.
- Vaciar carrito elimina todas las filas y muestra USD 0 y Carrito vacío.
- El carrito solo vive en memoria: recargar lo vacía.
- La actualización válida es asíncrona. Esperar resultados observables.
- Para acciones rápidas consecutivas, esperar que termine cada actualización
  antes de eliminar/vaciar o sumar otro producto: este laboratorio no prueba
  cancelación de operaciones en vuelo.

## Etapa 1 — Un caso, sin tablas
Crear un escenario que agregue 2 Mouse y compruebe:
- Fila Mouse con cantidad 2, precio USD 25 y subtotal USD 50.
- Total USD 50.
Construir CartPage e integrarlo en World con una instancia por escenario.
Diferenciar locator del producto en catálogo y locator de fila del carrito.
Primero escribir el feature propio; después construir los métodos necesarios.

## Etapa 2 — Data Table de entrada
Un step recibe columnas producto y cantidad para:
Mouse 2, Teclado 1.
Usar hashes y acciones secuenciales.
Comprobar ambas filas y total USD 130.
Leer celdas como strings; convertir/validar cuando corresponda.
Si solo verificás el último producto, la cobertura es insuficiente.

## Etapa 3 — Data Table de resultados
Un Then recibe columnas producto, cantidad y subtotal.
Recorrer las expectativas usando filas del carrito acotadas por producto.
Comprobar número de filas de datos, sin contar cabecera.
Los valores esperados deben ser independientes del cálculo de la aplicación.
No leer el total de la app para usar ese mismo valor como esperado.

## Etapa 4 — Scenario Outline de cantidades
Casos válidos independientes para Mouse: 1 -> USD 25; 5 -> USD 125.
Casos inválidos: 0, -1, 6 y 1.5.
Decidir si usar dos Outlines para representar comportamientos distintos.
Cada fila empieza con carrito vacío por su nuevo contexto/página.
Comprobar mensaje y que no se agregó nada en los casos rechazados.
Usar strings para fill, incluso si el dato representa un número.
No pases inválidos por un helper que los corrija automáticamente.

## Etapa 5 — Acumulación y límite
Agregar Mouse 2 y luego Mouse 1:
una sola fila, cantidad 3, subtotal y total USD 75.
Después intentar agregar Mouse 3:
mensaje de máximo, cantidad todavía 3 y total todavía USD 75.

## Etapa 6 — Eliminar y vaciar
Agregar Mouse 2 y Teclado 1: total USD 130.
Eliminar Mouse: solo Teclado, total USD 80.
Vaciar: ninguna fila de datos, mensaje vacío, total USD 0.

## Restricciones
- No modificar la app para hacer pasar los tests.
- Sin waitForTimeout, retries para ocultar fallos ni first/nth para silenciar ambigüedad.
- Contexto por escenario, nada de datos compartidos entre escenarios.
- Steps tipados con CustomWorld y Page Objects sin imports de Cucumber.
- Los getters de Locator no necesitan async.
- No hace falta BasePage.
- No construir todo de una vez: revisar cada etapa con el tutor.

## Verificación
typecheck y escenarios de cada etapa; luego suite secuencial y paralela.
Forzar una expectativa errónea para confirmar un fallo útil y su screenshot;
revertirla al terminar.

## Capturas y explicación
Por etapa: feature, método principal, aserción y resultado.
Explicar cómo se seleccionó un producto sin depender de su posición.
Para tablas: mostrar qué estructura devuelve hashes.
Para Outline: mostrar ejecuciones independientes.
Al terminar: ¿qué bug detectaría cada aserción?