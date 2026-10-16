const CLAVE = 'gasexpress_estado_v1';

const ADMIN_SEMILLA = {
  id: 1,
  nombre: 'Administrador',
  email: 'admin@gasexpress.cl',
  password: 'Admin@123',
  esAdmin: true,
};

function productoValido(p) {
  return p && typeof p.id === 'number' && typeof p.nombre === 'string'
    && typeof p.precio === 'number' && typeof p.stock === 'number';
}

export function cargarEstado(productosSemilla) {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado?.productos?.length) {
      return {
        productos: guardado.productos.filter(productoValido),
        carrito: (guardado.carrito ?? []).filter((item) =>
          guardado.productos.some((p) => p.id === item.id)),
        usuarios: guardado.usuarios?.length ? guardado.usuarios : [ADMIN_SEMILLA],
        aviso: null,
      };
    }
    return {
      productos: productosSemilla,
      carrito: [],
      usuarios: [ADMIN_SEMILLA],
      aviso: null,
    };
  } catch {
    return { productos: productosSemilla, carrito: [], usuarios: [ADMIN_SEMILLA], aviso: null };
  }
}

export function guardarEstado(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}
