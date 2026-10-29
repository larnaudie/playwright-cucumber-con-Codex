import { Given, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Mismo estilo que los otros steps del proyecto.
// Cucumber sigue siendo el runner; expect es de Playwright.
// Estos ejemplos NO interactuan con la pagina.
// async y this: CustomWorld mantienen la convencion, pero no son necesarios
// para transformar tablas. raw/rows/hashes/rowsHash/transpose son sincronos.
// toEqual/toBe/toThrow comprueban valores: no necesitan await ni reintentan.

// 1. raw() y rows(): conservan todas las columnas.
Given('que inspecciono con expect raw y rows con esta tabla',
  async function (this: CustomWorld, tabla: DataTable) {
    const completas = tabla.raw();
    const sinCabecera = tabla.rows();
    
    console.log('--------------- que inspecciono con expect raw y rows con esta tabla ----------------');
    console.log('raw() - incluye cabecera:', completas);
    console.log('rows() - sin primera fila:', sinCabecera);
    console.log('Fila 2, columna 1:', completas[1][0]);
    console.log('Fila 2, columna 2:', completas[1][1]);

    for (const fila of sinCabecera) {
      const producto = fila[0];
      const cantidad = fila[1];
      console.log('Producto:', producto, 'Cantidad:', cantidad);
    }

    expect(completas).toEqual([
      ['producto', 'cantidad'],
      ['Mouse', '2'],
      ['Teclado', '1'],
    ]);

    expect(sinCabecera).toEqual([
      ['Mouse', '2'],
      ['Teclado', '1'],
    ]);
  }
);

// 2. hashes(): la cabecera define las claves de los objetos.
Given('que inspecciono con expect hashes con esta tabla',
  async function (this: CustomWorld, tabla: DataTable) {
    const registros = tabla.hashes();

    console.log('--------------- que inspecciono con expect hashes con esta tabla ----------------');
    console.log('Tabla original usando raw():', tabla.raw());
    console.log('hashes():', registros);

    for (const fila of registros) {
      const cantidad = Number(fila.cantidad);
      const disponible = fila.disponible === 'true';

      console.log('Datos originales:', fila);
      console.log('Cantidad convertida:', cantidad);
      console.log('Disponible convertido:', disponible);
    }

    expect(registros).toEqual([
      { producto: 'Mouse', cantidad: '2', disponible: 'true' },
      { producto: 'Teclado', cantidad: '1', disponible: 'false' },
    ]);

    // Las celdas originales siguen siendo strings.
    expect(typeof registros[0].cantidad).toBe('string');
    // Un string no vacio es truthy: Boolean no interpreta el texto "false".
    expect(Boolean('false')).toBe(true);
  }
);

// 3. rowsHash(): dos columnas, todas las filas son pares clave/valor.
Given('que inspecciono con expect rowsHash con esta tabla',
  async function (this: CustomWorld, tabla: DataTable) {
    const datos = tabla.rowsHash();

    console.log('--------------- que inspecciono con expect rowsHash con esta tabla ----------------');
    console.log('Tabla original:', tabla.raw());
    console.log('rowsHash():', datos);
    console.log('Correo:', datos.correo);

    expect(datos).toEqual({
      nombre: 'Pablo',
      correo: 'pablo@example.test',
      pais: 'Uruguay',
    });

    // Si agregamos una cabecera, tambien sera parte del objeto.
    const conCabecera = new DataTable([
      ['campo', 'valor'],
      ['nombre', 'Pablo'],
    ]);

    console.log('rowsHash() con cabecera:', conCabecera.rowsHash());

    expect(conCabecera.rowsHash()).toEqual({
      campo: 'valor',
      nombre: 'Pablo',
    });
  }
);

// 4. Probamos un error esperado: el escenario pasa si ocurre ese error.
Given('que pruebo con expect el error esperado de rowsHash con esta tabla',
  async function (this: CustomWorld, tabla: DataTable) {
    console.log('--------------- que pruebo con expect el error esperado de rowsHash con esta tabla ----------------');
    console.log('Tabla con tres columnas:', tabla.raw());

    // Pasamos una funcion para que expect observe la excepcion al ejecutarla.
    expect(() => tabla.rowsHash()).toThrow(
      'rowsHash can only be called on a data table where all rows have exactly two columns'
    );

    console.log('Confirmado: rowsHash rechazo las tres columnas.');
  }
);

// 5. transpose(): devuelve otro DataTable con filas y columnas intercambiadas.
Given('que inspecciono con expect transpose con esta tabla',
  async function (this: CustomWorld, tabla: DataTable) {
    const original = tabla.raw();
    const transpuesta = tabla.transpose();
    
    console.log('--------------- que inspecciono con expect transpose con esta tabla ----------------');
    console.log('Antes - 2 filas por 3 columnas:', original);
    console.log('Despues - 3 filas por 2 columnas:', transpuesta.raw());

    expect(transpuesta.raw()).toEqual([
      ['nombre', 'correo'],
      ['Pablo', 'pablo@example.test'],
      ['Claudia', 'claudia@example.test'],
    ]);

    // Transponer no modifica la tabla original.
    expect(tabla.raw()).toEqual(original);

    // Paso adicional: convertir la tabla transpuesta en registros.
    const usuarios = transpuesta.hashes();
    console.log('hashes() aplicado DESPUES de transpose():', usuarios);

    expect(usuarios).toEqual([
      { nombre: 'Pablo', correo: 'pablo@example.test' },
      { nombre: 'Claudia', correo: 'claudia@example.test' },
    ]);
  }
);