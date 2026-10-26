// src/store/tiendaReducer.test.js — Pruebas UNITARIAS del reducer de la tienda.
//
// Qué prueba: las "reglas del negocio" de GasExpress, que viven en
// src/store/tiendaReducer.js: agregar al carrito, límites de stock, cambiar
// cantidades, calcular totales y envío, comprar, y el CRUD de productos del admin.
//
// Por qué es un test unitario: el reducer es una función pura (recibe un estado y
// una acción, y devuelve un estado nuevo). No necesita pantalla ni navegador,
// así que los tests son rápidos y muy fáciles de entender.
//
// Patrón de cada test (Preparar -> Actuar -> Comprobar):
//   1. Preparar: armamos un estado de ejemplo.
//   2. Actuar:   llamamos a tiendaReducer con una acción.
//   3. Comprobar: con expect(...) vemos que el resultado sea el esperado.
import { describe, expect, it } from 'vitest';
import {
  tiendaReducer,
  detalleCarrito,
  resumenCarrito,
} from './tiendaReducer.js';

// Producto de ejemplo para no repetir datos en cada test.
const producto = {
  id: 1,
  nombre: 'Cilindro 5 Kg',
  categoria: 'Gas',
  precio: 10000,
  stock: 2,
  imagen: '/imagenes/gas5kg.jpg',
};

// Arma un estado completo como el que usa la tienda (productos + carrito + usuarios + aviso).
// Si no se le pasa carrito, parte vacío.
function crearEstado(productos, carrito = []) {
  return { productos, carrito, usuarios: [], aviso: null };
}

describe('reglas del carrito', () => {
  it('acumula cantidades sin duplicar productos ni modificar el estado anterior', () => {
    const inicial = crearEstado([{ ...producto }]);
    const uno = tiendaReducer(inicial, { type: 'AGREGAR', id: 1 });
    const dos = tiendaReducer(uno, { type: 'AGREGAR', id: 1 });

    expect(dos.carrito).toEqual([{ id: 1, cantidad: 2 }]);
    // El estado original NO se tocó: el reducer siempre crea uno nuevo.
    expect(inicial.carrito).toEqual([]);
    expect(inicial.productos[0].stock).toBe(2);
  });

  it('no deja agregar más unidades que el stock disponible', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 2 }]);
    const siguiente = tiendaReducer(inicial, { type: 'AGREGAR', id: 1 });
    expect(siguiente.carrito).toEqual([{ id: 1, cantidad: 2 }]);
  });

  it('no agrega productos sin stock ni productos que no existen', () => {
    const inicial = crearEstado([{ ...producto, stock: 0 }]);
    // Si no puede hacer nada, devuelve exactamente el mismo estado.
    expect(tiendaReducer(inicial, { type: 'AGREGAR', id: 1 })).toBe(inicial);
    expect(tiendaReducer(inicial, { type: 'AGREGAR', id: 99 })).toBe(inicial);
  });

  it('agregar un producto deja un aviso de éxito', () => {
    const resultado = tiendaReducer(crearEstado([producto]), { type: 'AGREGAR', id: 1 });
    expect(resultado.aviso).toEqual({
      texto: 'Cilindro 5 Kg agregado al carrito.',
      tipo: 'success',
    });
  });

  it('cambia la cantidad de un producto del carrito', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 1 }]);
    const resultado = tiendaReducer(inicial, { type: 'CANTIDAD', id: 1, cantidad: 2 });
    expect(resultado.carrito).toEqual([{ id: 1, cantidad: 2 }]);
  });

  it('retira el producto del carrito si su cantidad llega a cero', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 1 }]);
    const resultado = tiendaReducer(inicial, { type: 'CANTIDAD', id: 1, cantidad: 0 });
    expect(resultado.carrito).toEqual([]);
  });

  it('QUITAR elimina solo el producto indicado', () => {
    const inicial = crearEstado(
      [producto, { ...producto, id: 2, nombre: 'Regulador' }],
      [{ id: 1, cantidad: 1 }, { id: 2, cantidad: 1 }],
    );
    const resultado = tiendaReducer(inicial, { type: 'QUITAR', id: 1 });
    expect(resultado.carrito).toEqual([{ id: 2, cantidad: 1 }]);
    expect(resultado.aviso.tipo).toBe('info');
  });

  it('VACIAR deja el carrito sin productos', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 2 }]);
    const resultado = tiendaReducer(inicial, { type: 'VACIAR' });
    expect(resultado.carrito).toEqual([]);
    expect(resultado.aviso.texto).toBe('Carrito vaciado.');
  });
});

describe('totales del carrito', () => {
  it('calcula unidades, subtotal, envío ($1.400) y total', () => {
    const estado = crearEstado([producto], [{ id: 1, cantidad: 2 }]);
    expect(resumenCarrito(estado)).toEqual({
      unidades: 2,
      subtotal: 20000,
      envio: 1400,
      total: 21400,
    });
  });

  it('con el carrito vacío todo vale cero (no se cobra envío)', () => {
    expect(resumenCarrito(crearEstado([producto]))).toEqual({
      unidades: 0,
      subtotal: 0,
      envio: 0,
      total: 0,
    });
  });

  it('detalleCarrito une cada línea del carrito con los datos completos del producto', () => {
    const estado = crearEstado([producto], [{ id: 1, cantidad: 2 }]);
    expect(detalleCarrito(estado)).toEqual([{ ...producto, cantidad: 2 }]);
  });

  it('detalleCarrito ignora líneas de productos que ya no existen', () => {
    const estado = crearEstado([producto], [{ id: 99, cantidad: 1 }]);
    expect(detalleCarrito(estado)).toEqual([]);
  });
});

describe('compra', () => {
  it('descuenta el stock y vacía el carrito al comprar', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 2 }]);
    const compra = tiendaReducer(inicial, { type: 'COMPRAR' });

    expect(compra.productos[0].stock).toBe(0);
    expect(compra.carrito).toEqual([]);
    expect(compra.aviso.texto).toBe('¡Pedido confirmado!');
    // El estado anterior sigue intacto.
    expect(inicial.productos[0].stock).toBe(2);
  });

  // Mejora pendiente: hoy COMPRAR no revisa si el stock alcanza.
  // Se deja anotada como "todo": Vitest la muestra en el reporte sin fallar.
  it.todo('rechaza la compra si un producto perdió stock mientras estaba en el carrito');
});

describe('CRUD de productos (panel Admin)', () => {
  it('crea un producto con id nuevo y convierte precio y stock a número', () => {
    const inicial = crearEstado([producto]);
    const resultado = tiendaReducer(inicial, {
      type: 'GUARDAR_PRODUCTO',
      id: null,
      // El formulario entrega textos, por eso llegan como '15000' y '4'.
      datos: { nombre: 'Regulador', categoria: 'Accesorios', precio: '15000', stock: '4', imagen: '' },
    });
    expect(resultado.productos).toHaveLength(2);
    expect(resultado.productos[1]).toMatchObject({
      id: 2,
      nombre: 'Regulador',
      precio: 15000,
      stock: 4,
    });
    expect(resultado.aviso.texto).toBe('Producto creado.');
  });

  it('el primer producto de una lista vacía recibe el id 1', () => {
    const resultado = tiendaReducer(crearEstado([]), {
      type: 'GUARDAR_PRODUCTO',
      id: null,
      datos: { nombre: 'Manguera', categoria: 'Accesorios', precio: '4990', stock: '10', imagen: '' },
    });
    expect(resultado.productos[0].id).toBe(1);
  });

  it('edita un producto manteniendo su id, y el carrito usa el precio nuevo', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 2 }]);
    const resultado = tiendaReducer(inicial, {
      type: 'GUARDAR_PRODUCTO',
      id: 1,
      datos: { ...producto, precio: '15000' },
    });
    expect(resultado.productos).toHaveLength(1);
    expect(resultado.productos[0].id).toBe(1);
    expect(detalleCarrito(resultado)[0].precio).toBe(15000);
    expect(resumenCarrito(resultado).subtotal).toBe(30000);
    expect(resultado.aviso.texto).toBe('Producto actualizado.');
  });

  it('elimina el producto del catálogo y también del carrito', () => {
    const inicial = crearEstado([producto], [{ id: 1, cantidad: 1 }]);
    const resultado = tiendaReducer(inicial, { type: 'ELIMINAR_PRODUCTO', id: 1 });
    expect(resultado.productos).toEqual([]);
    expect(resultado.carrito).toEqual([]);
    expect(resultado.aviso.tipo).toBe('warning');
  });
});

describe('usuarios y avisos', () => {
  it('GUARDAR_USUARIO agrega la cuenta nueva a la lista', () => {
    const usuario = { id: 5, nombre: 'Ana', email: 'ana@correo.cl', password: 'Clave#123', esAdmin: false };
    const resultado = tiendaReducer(crearEstado([]), { type: 'GUARDAR_USUARIO', usuario });
    expect(resultado.usuarios).toEqual([usuario]);
  });

  it('CERRAR_AVISO borra el mensaje', () => {
    const conAviso = { ...crearEstado([]), aviso: { texto: 'Hola', tipo: 'info' } };
    expect(tiendaReducer(conAviso, { type: 'CERRAR_AVISO' }).aviso).toBeNull();
  });

  it('una acción desconocida deja el estado igual', () => {
    const inicial = crearEstado([producto]);
    expect(tiendaReducer(inicial, { type: 'NO_EXISTE' })).toBe(inicial);
  });
});
