// src/utils/formatos.test.js — Pruebas UNITARIAS de las funciones de formato.
//
// Qué prueba: src/utils/formatos.js, que usan las tarjetas de producto, el carrito
// y el panel Admin:
//  - precioCLP: convierte un número en precio chileno (14990 -> "$14.990").
//  - estadoStock: según las unidades disponibles, devuelve el texto y el color
//    de la etiqueta (Agotado / Pocas unidades / Disponible).
import { describe, expect, it } from 'vitest';
import { precioCLP, estadoStock } from './formatos.js';

describe('precioCLP', () => {
  it('usa el signo $ y el punto como separador de miles', () => {
    // Se usa una expresión regular porque algunos sistemas insertan un espacio especial tras el $.
    expect(precioCLP(14990)).toMatch(/^\$\s?14\.990$/);
  });

  it('no muestra decimales', () => {
    expect(precioCLP(1400.6)).toMatch(/^\$\s?1\.401$/);
  });

  it('acepta números escritos como texto', () => {
    expect(precioCLP('20550')).toMatch(/^\$\s?20\.550$/);
  });
});

describe('estadoStock', () => {
  it.each([0, -3])('con %s unidades el producto está Agotado (rojo)', (stock) => {
    expect(estadoStock(stock)).toEqual({ texto: 'Agotado', variante: 'danger' });
  });

  it.each([1, 5])('con %s unidades quedan Pocas unidades (amarillo)', (stock) => {
    expect(estadoStock(stock)).toEqual({ texto: 'Pocas unidades', variante: 'warning' });
  });

  it('con 6 o más unidades está Disponible (verde)', () => {
    expect(estadoStock(6)).toEqual({ texto: 'Disponible', variante: 'success' });
    expect(estadoStock(50)).toEqual({ texto: 'Disponible', variante: 'success' });
  });
});
