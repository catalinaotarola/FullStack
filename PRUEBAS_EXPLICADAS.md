# Pruebas automatizadas de GasExpress (Laboratorio 14: Vitest y Testing Library)

Este documento explica **qué se agregó**, **cómo correrlo** y **cómo defenderlo**.

## 1. Cómo correr los tests

Desde la carpeta del proyecto (la que tiene `package.json`):

```bash
npm install          # instala también Vitest y Testing Library
npm run test:run     # corre todos los tests una vez y muestra el resultado
npm test             # modo "vigilar": se vuelve a ejecutar al guardar un archivo (salir con q)
npm run test:coverage  # además muestra qué porcentaje del código está cubierto
```

Si todo sale bien verás algo así:

```
 ✓ src/utils/formatos.test.js
 ✓ src/utils/validaciones.test.js
 ✓ src/store/tiendaReducer.test.js
 ✓ src/service/storage.test.js
 ✓ src/App.test.jsx
 Test Files  5 passed
```

El test marcado `todo` (rechazar compra sin stock) aparece como "pendiente". Es intencional, ver sección 6.

## 2. Qué es una prueba automatizada

Es un programa que **ejecuta una acción y comprueba su resultado**, sin que nadie haga clic a mano. Si alguien cambia el código y rompe algo, el test falla y avisa.

Todos los tests siguen el patrón **Preparar → Actuar → Comprobar**:

```javascript
it('agrega una unidad al carrito', () => {
  const estado = crearEstado([producto]);                          // 1. Preparar
  const resultado = tiendaReducer(estado, { type: 'AGREGAR', id: 1 }); // 2. Actuar
  expect(resultado.carrito).toEqual([{ id: 1, cantidad: 1 }]);     // 3. Comprobar
});
```

## 3. Las herramientas

| Herramienta | Para qué sirve |
|---|---|
| **Vitest** | Ejecuta los tests (`describe`, `it`, `expect`) |
| **Testing Library** (`@testing-library/react`) | Dibuja los componentes y los busca como los vería una persona |
| **user-event** | Simula escribir y hacer clic de verdad |
| **jest-dom** | Agrega comprobaciones para la pantalla: `toBeInTheDocument()`, `toBeDisabled()`... |
| **jsdom** | Un navegador simulado dentro de Node. No es un navegador real |

## 4. Archivos agregados o modificados

| Archivo | Qué hace |
|---|---|
| `vite.config.js` | Agrega el bloque `test`: entorno jsdom, archivo de preparación, qué archivos son tests y reporte de cobertura |
| `package.json` | Agrega los scripts `test`, `test:run`, `test:coverage` y las librerías de prueba |
| `src/test/setup.js` | Corre antes y después de cada test: vacía `localStorage`, limpia la pantalla y restaura los espías, para que los tests no se afecten entre sí |
| `src/store/tiendaReducer.test.js` | **Unitarios** de la lógica del carrito y del CRUD |
| `src/utils/validaciones.test.js` | **Unitarios** de validación de correo, contraseña, contacto y producto |
| `src/utils/formatos.test.js` | **Unitarios** del formato de precio y la etiqueta de stock |
| `src/service/storage.test.js` | **Unitarios** de guardar y leer en `localStorage` |
| `src/App.test.jsx` | **Integración**: la app completa usada como un usuario |
| `src/pages/Login.jsx` y `src/components/ProductoModal.jsx` | Cambio mínimo: se agregó `controlId` a cada campo del formulario (ver sección 7) |

Cada archivo de test empieza con un comentario que explica qué prueba y por qué.

## 5. Unitarios vs integración (se lo van a preguntar)

| | Test unitario | Test de integración |
|---|---|---|
| Qué prueba | Una función aislada | Varias piezas trabajando juntas |
| Ejemplo aquí | `tiendaReducer`, `validarEmail`, `precioCLP` | Agregar al carrito, finalizar compra, crear un producto en Admin |
| Velocidad | Muy rápido | Más lento |
| Necesita pantalla | No | Sí (jsdom) |
| Archivos | `*.test.js` de store, utils y service | `App.test.jsx` |

Los unitarios son fáciles porque el reducer y las validaciones son **funciones puras**: misma entrada, misma salida.

## 6. Qué prueba cada archivo

**`tiendaReducer.test.js`:**
- Agregar acumula cantidades sin duplicar ni modificar el estado anterior.
- No se puede superar el stock, ni agregar productos agotados o inexistentes.
- Cambiar cantidad; si llega a 0, el producto sale del carrito.
- Quitar y vaciar.
- Totales: unidades, subtotal, **envío $1.400** y total; carrito vacío igual a cero.
- Comprar: descuenta stock y vacía el carrito.
- CRUD: crear (id nuevo, conversión a número), editar, eliminar (también del carrito).
- Usuarios, cerrar aviso y acción desconocida.
- **`it.todo`**: "rechaza la compra si un producto perdió stock". Hoy `COMPRAR` no lo revisa. Se deja anotado como mejora pendiente en lugar de ocultarlo.

**`validaciones.test.js`:** cada mensaje de `diagnosticarEmail`, la regla de contraseña (mayúscula, número, símbolo, 6+ caracteres), teléfono, contacto (los 3 errores a la vez) y producto (precio, stock, nombre repetido, conservar nombre al editar).

**`formatos.test.js`:** `$14.990` sin decimales, y los tres estados de stock (Agotado, Pocas unidades, Disponible).

**`storage.test.js`:** partir de cero con el admin, guardar y recuperar, JSON dañado, estructura inválida, productos inválidos, limpiar carrito de productos que ya no existen y qué pasa si `localStorage` falla.

**`App.test.jsx`:**
- Rutas: inicio, cambiar de página, 404 y `/admin` sin sesión redirige al login.
- Registro con contraseña débil y válida, login incorrecto, login admin y cerrar sesión.
- Catálogo: búsqueda, sin resultados, producto agotado deshabilitado.
- Carrito: agregar con aviso, persistir al recargar, vacío, vaciar con confirmación y cancelar.
- **Compra completa**: Carrito → modal → Contacto → datos y dirección → pedido confirmado → baja el stock.
- Contacto: errores y confirmación.
- Admin: crear, validar y eliminar.

## 7. Cambios que hice a tu código (y por qué)

En `Login.jsx` y `ProductoModal.jsx` los `<Form.Group>` no tenían `controlId`, por lo que cada etiqueta (`Form.Label`) **no estaba conectada** a su campo. Se agregó `controlId` a cada uno.

Beneficios: los tests encuentran los campos por su etiqueta (`getByLabelText('Precio')`), y además mejora la accesibilidad (al hacer clic en la etiqueta se enfoca el campo, y los lectores de pantalla la leen). Es un cambio de una línea por campo y no altera el funcionamiento.

## 8. Diferencias con el proyecto del profesor

| Tema | Proyecto del profesor | GasExpress |
|---|---|---|
| Versiones | React 19, Vite 7, Vitest 4 | React 18, Vite 6, **Vitest 3** (compatible con tu Vite 6) |
| Productos | Con validación de stock dentro del reducer | La compra no valida stock en el reducer (`it.todo`) |
| Estado de prueba | `crearEstado` exportado desde el reducer | Se arma en el propio test (función local `crearEstado`) |
| Sesión | Se guarda en `localStorage` | Solo en memoria; el test inicia sesión desde la pantalla de login |
| Flujo de compra | Se confirma en el carrito | Carrito → Contacto (con dirección) |
| Número de tests | 39 | Ver el resumen al correr `npm run test:run` |

## 9. Preguntas que pueden hacerte

**¿Para qué sirven los tests?** Para comprobar automáticamente que la app funciona y detectar errores cuando se cambia el código.

**¿Qué diferencia hay entre unitario e integración?** Unitario prueba una función aislada; integración prueba varias piezas juntas, como un usuario.

**¿Qué es jsdom?** Un navegador simulado dentro de Node, para probar componentes sin abrir Chrome. No es un navegador real.

**¿Qué hace `MemoryRouter`?** Un router que guarda el historial en memoria, para elegir en qué ruta empieza cada test.

**¿Por qué se busca por texto o etiqueta y no por clase CSS?** Porque así se prueba lo que ve el usuario, y el test no se rompe si cambiamos el diseño.

**¿Qué hace `setup.js`?** Deja cada test en limpio: vacía `localStorage`, desmonta la pantalla y restaura los espías.

**¿Por qué usan `await`?** `userEvent` y las búsquedas `findBy` son asíncronas: esperan a que algo ocurra, como un modal con animación.

**¿Qué es el `it.todo`?** Un test pendiente. Documenta una mejora conocida (validar stock al comprar) sin hacer fallar la suite.

**¿Por qué el reducer es fácil de testear?** Es una función pura: no depende de nada externo y siempre devuelve lo mismo para los mismos datos.

**¿Qué mejorarían?** Validar el stock dentro del reducer, probar más componentes sueltos y subir la cobertura.

## 10. Si un test falla

1. Lee el mensaje: dice cuál test falló, qué se esperaba (`Expected`) y qué se obtuvo (`Received`).
2. Si se esperaba un texto de pantalla, revisa que el texto del componente sea idéntico (tildes, signos de apertura, mayúsculas).
3. Si dice `Unable to find an element...`, el texto, etiqueta o rol buscado no existe o cambió.
4. Si aparece `Failed to resolve import`, falta una librería: corre `npm install`.
