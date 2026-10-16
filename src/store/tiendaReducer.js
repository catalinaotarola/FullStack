// Agrega un mensaje de aviso al estado, para mostrarlo como <Alert> en Layout.jsx
function conAviso(estado, texto, tipo = 'success') {
  return { ...estado, aviso: { texto, tipo } };
}

// El reducer: recibe el estado actual + una "acción" (qué se quiere hacer)
// y devuelve un estado NUEVO completo. Nunca modifica "estado" directamente.
export function tiendaReducer(estado, accion) {
  switch (accion.type) {

    case 'AGREGAR': {
      const producto = estado.productos.find((p) => p.id === accion.id);
      if (!producto || producto.stock <= 0) return estado; // sin stock, no hace nada
      const yaEsta = estado.carrito.find((i) => i.id === accion.id);
      const carrito = yaEsta
        ? estado.carrito.map((i) => i.id === accion.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, producto.stock) }
            : i)
        : [...estado.carrito, { id: producto.id, cantidad: 1 }];
      return conAviso({ ...estado, carrito }, `${producto.nombre} agregado al carrito.`);
    }

    case 'CANTIDAD': {
      const carrito = estado.carrito
        .map((i) => (i.id === accion.id ? { ...i, cantidad: accion.cantidad } : i))
        .filter((i) => i.cantidad > 0); // si baja a 0, se elimina solo
      return { ...estado, carrito };
    }

    case 'QUITAR':
      return conAviso(
        { ...estado, carrito: estado.carrito.filter((i) => i.id !== accion.id) },
        'Producto eliminado del carrito.', 'info',
      );

    case 'VACIAR':
      return conAviso({ ...estado, carrito: [] }, 'Carrito vaciado.', 'info');

    case 'COMPRAR': {
      // descuenta el stock de cada producto comprado y vacía el carrito
      const productos = estado.productos.map((p) => {
        const item = estado.carrito.find((i) => i.id === p.id);
        return item ? { ...p, stock: p.stock - item.cantidad } : p;
      });
      return conAviso({ ...estado, productos, carrito: [] }, '¡Pedido confirmado!');
    }

    case 'GUARDAR_PRODUCTO': {
      const esNuevo = accion.id == null;
      const id = esNuevo
        ? Math.max(0, ...estado.productos.map((p) => p.id)) + 1 // id autoincremental
        : accion.id;
      const datosNormalizados = {
        ...accion.datos,
        precio: Number(accion.datos.precio),
        stock: Number(accion.datos.stock),
      };
      const productos = esNuevo
        ? [...estado.productos, { id, ...datosNormalizados }]
        : estado.productos.map((p) => (p.id === id ? { ...p, ...datosNormalizados } : p));
      return conAviso({ ...estado, productos }, esNuevo ? 'Producto creado.' : 'Producto actualizado.');
    }

    case 'ELIMINAR_PRODUCTO':
      return conAviso({
        ...estado,
        productos: estado.productos.filter((p) => p.id !== accion.id),
        carrito: estado.carrito.filter((i) => i.id !== accion.id), // también lo purga del carrito
      }, 'Producto eliminado.', 'warning');

    case 'GUARDAR_USUARIO':
      return conAviso(
        { ...estado, usuarios: [...estado.usuarios, accion.usuario] },
        'Cuenta creada con éxito.',
      );

    case 'CERRAR_AVISO':
      return { ...estado, aviso: null };

    default:
      return estado;
  }
}

// Junta cada línea del carrito (id + cantidad) con los datos completos del producto
export function detalleCarrito(estado) {
  return estado.carrito
    .map((item) => {
      const producto = estado.productos.find((p) => p.id === item.id);
      return producto ? { ...producto, cantidad: item.cantidad } : null;
    })
    .filter(Boolean);
}

// Calcula unidades, subtotal, envío y total del carrito
export function resumenCarrito(estado) {
  const detalle = detalleCarrito(estado);
  const unidades = detalle.reduce((total, p) => total + p.cantidad, 0);
  const subtotal = detalle.reduce((total, p) => total + p.cantidad * p.precio, 0);
  const envio = unidades > 0 ? 1400 : 0;
  return { unidades, subtotal, envio, total: subtotal + envio };
}
