// src/service/storage.test.js — Pruebas UNITARIAS de la persistencia en localStorage.
//
// Qué prueba: src/service/storage.js, que guarda la tienda (productos, carrito y
// usuarios) en el navegador y la vuelve a leer al abrir la app.
//  - cargarEstado: lee lo guardado; si no hay nada o está dañado, usa los datos iniciales.
//  - guardarEstado: escribe en localStorage y avisa (true/false) si pudo hacerlo.
//
// localStorage lo aporta jsdom (el navegador simulado) y se vacía antes de cada test
// gracias a src/test/setup.js.
import { describe, expect, it, vi } from 'vitest';
import { cargarEstado, guardarEstado } from './storage.js';

const CLAVE = 'gasexpress_estado_v1';

// Productos de ejemplo que hacen de "datos iniciales".
const semilla = [
  { id: 1, nombre: 'Cilindro 5 Kg', categoria: 'Gas', precio: 10000, stock: 5, imagen: '', destacado: false },
  { id: 2, nombre: 'Regulador', categoria: 'Accesorios', precio: 12990, stock: 3, imagen: '', destacado: true },
];

describe('cargarEstado', () => {
  it('sin nada guardado parte con los productos iniciales y el administrador', () => {
    const estado = cargarEstado(semilla);
    expect(estado.productos).toEqual(semilla);
    expect(estado.carrito).toEqual([]);
    expect(estado.aviso).toBeNull();
    expect(estado.usuarios).toHaveLength(1);
    expect(estado.usuarios[0]).toMatchObject({ email: 'admin@gasexpress.cl', esAdmin: true });
  });

  it('recupera productos y carrito después de guardarlos', () => {
    const estado = { productos: semilla, carrito: [{ id: 1, cantidad: 2 }], usuarios: [], aviso: null };
    expect(guardarEstado(estado)).toBe(true);
    expect(cargarEstado([]).carrito).toEqual([{ id: 1, cantidad: 2 }]);
    expect(cargarEstado([]).productos).toEqual(semilla);
  });

  it('se recupera si el JSON guardado está dañado', () => {
    localStorage.setItem(CLAVE, '{esto-no-es-json');
    expect(cargarEstado(semilla).productos).toEqual(semilla);
  });

  it('se recupera si la estructura guardada no es la esperada', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ productos: 'incorrecto', carrito: null }));
    const estado = cargarEstado(semilla);
    expect(estado.productos).toEqual(semilla);
    expect(estado.carrito).toEqual([]);
  });

  it('descarta productos inválidos', () => {
    localStorage.setItem(
      CLAVE,
      JSON.stringify({ productos: [semilla[0], { id: 'x', nombre: 5 }], carrito: [] }),
    );
    expect(cargarEstado([]).productos).toEqual([semilla[0]]);
  });

  it('limpia del carrito los productos que ya no existen', () => {
    localStorage.setItem(
      CLAVE,
      JSON.stringify({ productos: semilla, carrito: [{ id: 1, cantidad: 2 }, { id: 99, cantidad: 1 }] }),
    );
    expect(cargarEstado([]).carrito).toEqual([{ id: 1, cantidad: 2 }]);
  });

  it('si no hay usuarios guardados, vuelve a crear el administrador', () => {
    localStorage.setItem(CLAVE, JSON.stringify({ productos: semilla, carrito: [], usuarios: [] }));
    expect(cargarEstado([]).usuarios[0].esAdmin).toBe(true);
  });
});

describe('guardarEstado', () => {
  it('informa false si el navegador rechaza la escritura (por ejemplo, sin espacio)', () => {
    // vi.spyOn "espía" setItem y lo obliga a fallar, solo durante este test.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Sin espacio');
    });
    expect(guardarEstado({ productos: [], carrito: [], usuarios: [], aviso: null })).toBe(false);
  });
});
