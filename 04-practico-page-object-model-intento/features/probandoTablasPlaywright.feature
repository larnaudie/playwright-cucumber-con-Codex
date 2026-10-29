# Ejecutar desde la raiz del proyecto:
# npm test -- features/probandoTablasPlaywright.feature
# No requiere levantar la app: no navegamos ni usamos la API.
# Los hooks existentes SI abren Chromium y requieren el navegador instalado.
# Mirar la consola: cada step imprime la entrada y su transformacion.
Feature: Entender las transformaciones de DataTable

  Scenario: raw y rows conservan todas las columnas
    Given que inspecciono con expect raw y rows con esta tabla
      | producto | cantidad |
      | Mouse    | 2        |
      | Teclado  | 1        |

  Scenario: hashes convierte registros con cabecera en objetos
    Given que inspecciono con expect hashes con esta tabla
      | producto | cantidad | disponible |
      | Mouse    | 2        | true       |
      | Teclado  | 1        | false      |

  Scenario: rowsHash convierte pares clave valor en un objeto
    Given que inspecciono con expect rowsHash con esta tabla
      | nombre | Pablo              |
      | correo | pablo@example.test |
      | pais   | Uruguay            |

  Scenario: rowsHash rechaza tres columnas
    Given que pruebo con expect el error esperado de rowsHash con esta tabla
      | nombre | correo             | pais    |
      | Pablo  | pablo@example.test | Uruguay |

  Scenario: transpose intercambia filas y columnas sin convertirlas en objetos
    Given que inspecciono con expect transpose con esta tabla
      | nombre | Pablo              | Claudia              |
      | correo | pablo@example.test | claudia@example.test |