// vite.config.js — Configuración de Vite Y de Vitest (el programa que corre los tests).
//
// Qué hace este archivo:
//  - "plugins: [react()]" permite que Vite entienda JSX (el HTML dentro de JavaScript).
//  - El bloque "test" le dice a Vitest cómo ejecutar las pruebas:
//      * environment 'jsdom'  -> simula un navegador (document, localStorage, etc.)
//        dentro de Node, para poder probar componentes sin abrir Chrome.
//      * setupFiles           -> archivo que corre ANTES de cada test (ver src/test/setup.js).
//      * include              -> qué archivos se consideran tests (los que terminan en .test.js o .test.jsx).
//      * coverage             -> reporte de cuánto código está cubierto por los tests
//        (se usa con "npm run test:coverage").
//
// IMPORTANTE: defineConfig se importa desde 'vitest/config' (no desde 'vite')
// para que Vite acepte la propiedad "test".
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/data/**',
        'src/test/**',
        'src/**/*.test.{js,jsx}',
      ],
    },
  },
});
