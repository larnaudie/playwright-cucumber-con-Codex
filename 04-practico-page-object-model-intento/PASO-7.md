# Paso 7 — Locators dinámicos y composición
La app ahora tiene tres productos con botones Agregar idénticos.
El encabezado tiene Ayuda, disponible tanto en login como en Mi cuenta.
No se implementaron Page Objects ni steps nuevos: los construiremos juntos.
Backup de la app previa: app/index.antes-paso7.html.

## 7A — Locator dinámico
1. Iniciar sesión y observar la lista.
2. En AccountPage, construir un método getProducto(nombre: string): Locator.
3. Acotar por listitem que contenga un heading con nombre exacto.
4. Dentro del producto, localizar su botón Agregar.
5. Crear agregarProducto(nombre): Promise<void>.
6. Verificar data-testid cart-summary mediante una aserción reintentable.
7. Probar Mouse y Teclado de forma independiente, idealmente con Scenario Outline.
No usar first/nth ni seleccionar todos los Agregar a la vez.
La app es una simulación: el resumen muestra el último producto agregado;
no implementa cantidades, persistencia ni un backend de carrito.

## 7B — Componente compartido
1. Crear components/HeaderComponent.ts, recibiendo Page en el constructor.
2. Acotar el botón Ayuda dentro del header (rol banner).
3. Implementar abrirAyuda y cerrarAyuda.
4. Componer HeaderComponent dentro de LoginPage y AccountPage.
5. Usar la misma clase desde ambas pantallas; no duplicar locators.
6. Verificar el dialog con nombre Ayuda del portal.
7. Comprobar ayuda antes y después de iniciar sesión.
Un dialog modal puede ubicarse fuera del header: no buscarlo dentro del banner.
El encabezado es el mismo componente persistente de la app, accesible desde ambas pantallas.

## Capturas para tu documento
- Lista con tres botones Agregar.
- Locator filtrado por nombre y método parametrizado.
- Escenario pasando con productos diferentes.
- Componente y cómo lo contienen los dos Page Objects.
- Diálogo visible desde login y desde cuenta.

Antes de avanzar, ejecutar la suite previa para comprobar que se conservó el comportamiento.
Si el servidor abierto pertenece a otra copia del práctico, detenerlo y ejecutar npm run app
desde esta carpeta. Si ya sirve esta carpeta, basta recargar: lee el HTML en cada request.