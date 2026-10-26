// src/App.test.jsx — Pruebas de INTEGRACIÓN de la aplicación completa.
//
// Qué prueba: que las piezas funcionen juntas, como las usaría una persona:
// navegación entre páginas, ruta 404, protección de /admin, registro e inicio de
// sesión, filtros del catálogo, carrito, compra completa (Carrito -> Contacto),
// CRUD del administrador y validación del formulario de contacto.
//
// Cómo funciona:
//  - render(...) dibuja <App /> dentro de un MemoryRouter. MemoryRouter es un router
//    que guarda el historial en memoria (no usa la barra de direcciones), y nos deja
//    elegir en qué ruta empieza la app (initialEntries).
//  - Los tests buscan elementos como los vería el usuario: por su rol y nombre
//    (botón "Finalizar compra"), por su etiqueta (campo "Correo electrónico") o por
//    su texto, en vez de buscar clases CSS internas.
//  - userEvent simula acciones reales (escribir, hacer clic). Son asíncronas: se usa await.
//  - findBy... y waitFor esperan a que algo aparezca (por ejemplo, un modal con animación).
//  - La sesión vive solo en memoria (useState), por eso para probar el panel Admin
//    primero hay que iniciar sesión desde la pantalla de login, igual que un usuario real.
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from './App.jsx';
import { productosIniciales } from './data/productosIniciales.js';

const CLAVE = 'gasexpress_estado_v1';

// Dibuja la app empezando en la ruta indicada (por defecto, el inicio).
function renderApp(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );
}

// Deja guardado en localStorage un estado de tienda antes de abrir la app.
function guardarTienda(carrito = [], productos = productosIniciales) {
  localStorage.setItem(CLAVE, JSON.stringify({ productos, carrito }));
}

// Lee de localStorage lo que la app guardó.
function leerTienda() {
  return JSON.parse(localStorage.getItem(CLAVE));
}

// Inicia sesión como administrador desde la pantalla de login.
// (getAllByLabelText(...)[0] es el campo del formulario "Iniciar sesión"; el [1] es el de "Crear cuenta".)
async function iniciarSesionAdmin(user) {
  await user.type(screen.getAllByLabelText('Correo electrónico')[0], 'admin@gasexpress.cl');
  await user.type(screen.getAllByLabelText('Contraseña')[0], 'Admin@123');
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
}

// Entra al panel de administración: login + clic en el enlace "Admin" del menú.
async function entrarAlPanelAdmin(user) {
  renderApp('/login');
  await iniciarSesionAdmin(user);
  await user.click(await screen.findByRole('link', { name: 'Admin' }));
  await screen.findByRole('heading', { name: 'Administración de productos' });
}

// Completa el formulario del modal de producto.
async function rellenarProducto(user, nombre) {
  await user.type(screen.getByLabelText('Nombre del producto'), nombre);
  await user.type(screen.getByLabelText('Categoría'), 'Audio');
  await user.type(screen.getByLabelText('Precio'), '15000');
  await user.type(screen.getByLabelText('Stock'), '3');
  await user.type(screen.getByLabelText('URL de imagen'), 'https://example.com/audio.jpg');
}

describe('navegación y rutas', () => {
  it('muestra la página de inicio', () => {
    renderApp('/');
    expect(
      screen.getByRole('heading', { name: 'Gas a domicilio, rápido y seguro' }),
    ).toBeInTheDocument();
  });

  it('cambia de página con el menú sin recargar', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.click(screen.getByRole('link', { name: 'Productos' }));
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
  });

  it('muestra la página 404 en una dirección desconocida', () => {
    renderApp('/ruta-inexistente');
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });

  it('manda a login a quien entra a /admin sin ser administrador', async () => {
    renderApp('/admin');
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Administración de productos' }),
    ).not.toBeInTheDocument();
  });
});

describe('registro e inicio de sesión', () => {
  it('rechaza una contraseña débil al crear la cuenta', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez');
    await user.type(screen.getAllByLabelText('Correo electrónico')[1], 'ana@correo.cl');
    await user.type(screen.getAllByLabelText('Contraseña')[1], '123');
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));
    expect(
      await screen.findByText(
        'La contraseña debe tener 6+ caracteres, una mayúscula, un número y un símbolo.',
      ),
    ).toBeInTheDocument();
  });

  it('crea la cuenta cuando los datos son válidos', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez');
    await user.type(screen.getAllByLabelText('Correo electrónico')[1], 'ana@correo.cl');
    await user.type(screen.getAllByLabelText('Contraseña')[1], 'Clave#123');
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));
    expect(
      await screen.findByText('¡Cuenta creada! Ahora puedes iniciar sesión.'),
    ).toBeInTheDocument();
    await waitFor(() => {
      const usuarios = leerTienda().usuarios;
      expect(usuarios.some((u) => u.email === 'ana@correo.cl')).toBe(true);
    });
  });

  it('muestra un error si el correo o la contraseña son incorrectos', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getAllByLabelText('Correo electrónico')[0], 'admin@gasexpress.cl');
    await user.type(screen.getAllByLabelText('Contraseña')[0], 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
  });

  it('el administrador entra, ve el enlace Admin y puede cerrar sesión', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await iniciarSesionAdmin(user);
    expect(await screen.findByRole('link', { name: 'Admin' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cerrar sesión/ }));
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });
});

describe('catálogo y carrito', () => {
  it('filtra los productos por el texto de la búsqueda', async () => {
    const user = userEvent.setup();
    renderApp('/productos');
    await user.type(screen.getByPlaceholderText('Buscar producto...'), 'regulador');
    expect(screen.getByText('Regulador Universal')).toBeInTheDocument();
    expect(screen.queryByText('Cilindro 2 Kg')).not.toBeInTheDocument();
  });

  it('avisa cuando ningún producto coincide con el filtro', async () => {
    const user = userEvent.setup();
    renderApp('/productos');
    await user.type(screen.getByPlaceholderText('Buscar producto...'), 'zzzz');
    expect(screen.getByText('No hay productos que coincidan con el filtro.')).toBeInTheDocument();
  });

  it('no deja agregar un producto agotado', () => {
    renderApp('/productos');
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled();
  });

  it('agrega un producto, muestra el aviso y guarda el carrito', async () => {
    const user = userEvent.setup();
    renderApp('/productos');
    // El primer botón "Agregar al carrito" pertenece al primer producto de la lista.
    await user.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0]);
    expect(
      await screen.findByText(`${productosIniciales[0].nombre} agregado al carrito.`),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(leerTienda().carrito).toEqual([{ id: productosIniciales[0].id, cantidad: 1 }]),
    );
  });

  it('conserva el carrito al cerrar y volver a abrir la aplicación', async () => {
    const user = userEvent.setup();
    const vista = renderApp('/productos');
    await user.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0]);
    await waitFor(() => expect(leerTienda().carrito).toHaveLength(1));
    vista.unmount();

    renderApp('/carrito');
    expect(screen.getByText(productosIniciales[0].nombre)).toBeInTheDocument();
  });

  it('muestra el mensaje de carrito vacío', () => {
    renderApp('/carrito');
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
  });

  it('vacía el carrito después de confirmar', async () => {
    guardarTienda([{ id: 1, cantidad: 1 }]);
    const user = userEvent.setup();
    renderApp('/carrito');
    await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByText('Tu carrito está vacío.')).toBeInTheDocument();
  });

  it('cancelar la confirmación deja el carrito como estaba', async () => {
    guardarTienda([{ id: 1, cantidad: 1 }]);
    const user = userEvent.setup();
    renderApp('/carrito');
    await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText(productosIniciales[0].nombre)).toBeInTheDocument();
  });
});

describe('compra completa: Carrito -> Contacto', () => {
  it('finaliza la compra, pide los datos de despacho y descuenta el stock', async () => {
    guardarTienda([{ id: 1, cantidad: 1 }]);
    const user = userEvent.setup();
    renderApp('/carrito');

    // 1) En el carrito: finalizar compra y confirmar en el modal.
    await user.click(screen.getByRole('button', { name: 'Finalizar compra' }));
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    // 2) Nos lleva a Contacto, donde se completan los datos.
       expect(await screen.findByRole('heading', { name: 'Contacto', level: 1 })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.cl');
    await user.type(screen.getByLabelText('Dirección de despacho'), 'Av. Siempre Viva 742, Viña del Mar');
    await user.type(screen.getByLabelText('Asunto'), 'Pedido de gas');
    await user.click(screen.getByRole('button', { name: 'Validar mensaje' }));

    // 3) Pedido confirmado: baja el stock y el carrito queda vacío.
    expect(await screen.findByText(/Recibimos tu información/)).toBeInTheDocument();
    await waitFor(() => {
      const tienda = leerTienda();
      expect(tienda.carrito).toEqual([]);
      expect(tienda.productos.find((p) => p.id === 1).stock).toBe(productosIniciales[0].stock - 1);
    });
  });
});

describe('formulario de contacto', () => {
  it('muestra errores al enviar vacío y confirma cuando los datos son válidos', async () => {
    const user = userEvent.setup();
    renderApp('/contacto');

    await user.click(screen.getByRole('button', { name: 'Validar mensaje' }));
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu dirección de despacho.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@correo.cl');
    await user.type(screen.getByLabelText('Dirección de despacho'), 'Calle 1 #234');
    await user.type(screen.getByLabelText('Asunto'), 'Consulta');
    await user.type(screen.getByLabelText('Mensaje'), 'Quiero saber el stock.');
    await user.click(screen.getByRole('button', { name: 'Validar mensaje' }));

    expect(await screen.findByText('¡Mensaje validado con éxito!')).toBeInTheDocument();
    // Después de enviar, el formulario queda limpio.
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
  });
});

describe('panel de administración', () => {
  it('crea un producto nuevo y lo guarda', async () => {
    const user = userEvent.setup();
    await entrarAlPanelAdmin(user);

    await user.click(screen.getByRole('button', { name: '+ Nuevo producto' }));
    await rellenarProducto(user, 'Audífonos');
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));

    expect(await screen.findByText('Audífonos')).toBeInTheDocument();
    await waitFor(() =>
      expect(leerTienda().productos).toHaveLength(productosIniciales.length + 1),
    );
  });

  it('muestra errores de validación y rechaza un nombre repetido', async () => {
    const user = userEvent.setup();
    await entrarAlPanelAdmin(user);

    await user.click(screen.getByRole('button', { name: '+ Nuevo producto' }));
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByText('El precio debe ser mayor a 0.')).toBeInTheDocument();

    await rellenarProducto(user, 'Regulador Universal');
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }));
    expect(screen.getByText('Ya existe un producto con ese nombre.')).toBeInTheDocument();
  });

  it('elimina un producto después de confirmar', async () => {
    const user = userEvent.setup();
    await entrarAlPanelAdmin(user);

    const fila = screen.getByRole('row', { name: /Manguera 1\.5m/ });
    await user.click(within(fila).getByRole('button', { name: 'Eliminar' }));
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(screen.queryByText(/Manguera 1\.5m/)).not.toBeInTheDocument());
    await waitFor(() =>
      expect(leerTienda().productos.some((p) => p.nombre === 'Manguera 1.5m')).toBe(false),
    );
  });
});
