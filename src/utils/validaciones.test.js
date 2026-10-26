// src/utils/validaciones.test.js — Pruebas UNITARIAS de las validaciones de formularios.
//
// Qué prueba: las funciones de src/utils/validaciones.js que usan Login (correo y
// contraseña), Contacto (correo, asunto, mensaje) y el panel Admin (datos de producto).
//
// Cómo se leen los resultados:
//  - Las funciones "validar..." devuelven true/false.
//  - diagnosticarEmail devuelve un mensaje de error, o null si el correo es válido.
//  - validarContacto y validarProducto devuelven un objeto { campo: 'mensaje' }.
//    Un objeto vacío ({}) significa "no hay errores".
//
// Por qué se prueban aparte: son funciones puras (no dependen de React), así que
// se pueden comprobar con muchos casos distintos de forma rápida.
import { describe, expect, it } from 'vitest';
import {
  validarEmail,
  diagnosticarEmail,
  validarPassword,
  validarTelefono,
  validarTextoMinimo,
  validarContacto,
  validarProducto,
} from './validaciones.js';

describe('correo electrónico', () => {
  it('acepta correos con formato válido', () => {
    expect(validarEmail('ana@correo.cl')).toBe(true);
    expect(validarEmail('  ana@correo.cl  ')).toBe(true); // ignora espacios alrededor
  });

  it('rechaza correos con formato inválido', () => {
    expect(validarEmail('ana')).toBe(false);
    expect(validarEmail('ana@correo')).toBe(false);
    expect(validarEmail('ana @correo.cl')).toBe(false);
  });

  // it.each repite el mismo test con varias filas: [correo, mensaje esperado].
  it.each([
    ['', 'El correo electrónico es obligatorio.'],
    ['anacorreo.cl', 'Falta el símbolo "@" en tu correo electrónico.'],
    ['a@@correo.cl', 'El correo no puede tener más de un "@".'],
    ['@correo.cl', 'Falta el nombre antes del "@" (ej: nombre@ejemplo.com).'],
    ['ana@correo', 'Falta el dominio después del "@" (ej: @ejemplo.com).'],
    ['ana@correo.', 'El correo no puede terminar en un punto.'],
  ])('diagnostica "%s" con un mensaje específico', (correo, mensaje) => {
    expect(diagnosticarEmail(correo)).toBe(mensaje);
  });

  it('diagnosticarEmail devuelve null si el correo es correcto', () => {
    expect(diagnosticarEmail('ana@correo.cl')).toBeNull();
  });
});

describe('contraseña', () => {
  it.each(['Clave#1', 'Abc123!', 'Admin@123'])('acepta "%s"', (password) => {
    expect(validarPassword(password)).toBe(true);
  });

  it.each([
    ['clave#1', 'sin mayúscula'],
    ['Clave#a', 'sin número'],
    ['Clave12', 'sin símbolo'],
    ['Cl#1', 'demasiado corta'],
    ['', 'vacía'],
  ])('rechaza "%s" (%s)', (password) => {
    expect(validarPassword(password)).toBe(false);
  });
});

describe('teléfono y texto mínimo', () => {
  it('valida teléfonos de 7 a 15 caracteres con números, +, espacios o guiones', () => {
    expect(validarTelefono('+56 9 1234 5678')).toBe(true);
    expect(validarTelefono('123')).toBe(false);
    expect(validarTelefono('abcdefgh')).toBe(false);
  });

  it('validarTextoMinimo cuenta los caracteres sin los espacios de los extremos', () => {
    expect(validarTextoMinimo('abc', 3)).toBe(true);
    expect(validarTextoMinimo('  ab  ', 3)).toBe(false);
  });
});

describe('formulario de contacto', () => {
  it('no devuelve errores si todo está correcto', () => {
    expect(
      validarContacto({
        email: 'ana@correo.cl',
        asunto: 'Consulta por stock',
        mensaje: 'Quiero saber si hay stock.',
      }),
    ).toEqual({});
  });

  it('informa los tres errores a la vez, sin detenerse en el primero', () => {
    const errores = validarContacto({ email: 'mal', asunto: 'a', mensaje: 'b' });
    expect(Object.keys(errores)).toEqual(['email', 'asunto', 'mensaje']);
  });
});

describe('formulario de producto (Admin)', () => {
  const valido = { nombre: 'Regulador', categoria: 'Accesorios', precio: '10000', stock: '0' };

  it('acepta un producto válido, incluso con stock cero', () => {
    expect(validarProducto(valido, [], null)).toEqual({});
  });

  it('informa todos los campos incorrectos en una misma validación', () => {
    const errores = validarProducto(
      { nombre: ' ', categoria: 'x', precio: '', stock: '' },
      [],
      null,
    );
    expect(Object.keys(errores)).toEqual(['nombre', 'categoria', 'precio', 'stock']);
    expect(errores.precio).toBe('El precio debe ser mayor a 0.');
  });

  it('rechaza un precio de cero o negativo y un stock negativo', () => {
    expect(validarProducto({ ...valido, precio: '0' }, [], null)).toHaveProperty('precio');
    expect(validarProducto({ ...valido, precio: '-5' }, [], null)).toHaveProperty('precio');
    expect(validarProducto({ ...valido, stock: '-1' }, [], null)).toHaveProperty('stock');
  });

  it('rechaza un nombre repetido sin importar mayúsculas ni espacios', () => {
    const existentes = [{ id: 1, nombre: 'Regulador' }];
    const errores = validarProducto({ ...valido, nombre: '  REGULADOR ' }, existentes, null);
    expect(errores.nombre).toBe('Ya existe un producto con ese nombre.');
  });

  it('permite conservar el propio nombre al editar un producto', () => {
    const existentes = [{ id: 1, nombre: 'Regulador' }];
    expect(validarProducto(valido, existentes, 1)).toEqual({});
  });
});
