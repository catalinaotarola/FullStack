// src/test/setup.js — Preparación que se ejecuta antes y después de CADA test.
//
// Para qué sirve:
//  1. Importa los "matchers" de jest-dom, que agregan comprobaciones útiles para
//     la pantalla, como toBeInTheDocument(), toBeDisabled() o toHaveTextContent().
//  2. Deja localStorage vacío antes de cada test, para que partan todos desde cero.
//  3. Después de cada test desmonta lo que se dibujó (cleanup), vacía localStorage
//     y restaura cualquier "espía" (vi.spyOn) para que un test no afecte al siguiente.
//  4. Reemplaza window.scrollTo por una función falsa: nuestra app la usa
//     (ScrollToTop y Layout) pero jsdom no la implementa y mostraría errores en la consola.
//
// Regla de oro: cada test debe poder ejecutarse solo y dar el mismo resultado.
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
