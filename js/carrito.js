/* ============================================================
   CARRITO.JS - Carrito de compras multifuncional (GasExpress)
   ------------------------------------------------------------
   1) Estado -> array "carrito" en memoria
   2) Persistencia  -> localStorage (guardarCarrito / actualizarCarrito)
   3) Operaciones -> agregar, eliminar, cambiar cantidad, vaciar
   4) Render -> reconstruye el DOM a partir del estado
   5) Eventos -> delegación de eventos sobre document
*/
const CARRITO_KEY = 'gasexpress_carrito';
const CANTIDAD_MAXIMA = 20;

/* ---------- 1) Estado inicial: se recupera desde localStorage ---------- */
let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

/* ---------- 2) Persistencia centralizada ---------- */
function guardarCarrito() {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

function actualizarCarrito() {
    guardarCarrito();
    actualizarBadgeCarrito();
    renderCarrito(); // no hace nada si la página actual no tiene #carrito-contenido
}

/* ---------- Utilidades ---------- */
function formatearCLP(numero) {
    return '$' + Number(numero).toLocaleString('es-CL');
}

function calcularTotal(lista) {
    return lista.reduce((acumulador, item) => acumulador + item.precio * item.cantidad, 0);
}

function calcularUnidades(lista) {
    return lista.reduce((acumulador, item) => acumulador + item.cantidad, 0);
}

/* ---------- 3) Operaciones sobre el estado ---------- */
function agregarAlCarrito(producto) {
    if (!producto || !producto.id) {
        console.error('Producto inválido, no se puede agregar al carrito');
        return;
    }

    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
        if (existente.cantidad >= CANTIDAD_MAXIMA) {
            mostrarToast(`Alcanzaste el máximo de ${CANTIDAD_MAXIMA} unidades para ${producto.nombre}`, 'warning');
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            imagen: producto.imagen || '',
            cantidad: 1
        });
    }

    actualizarCarrito();
    mostrarToast(`${producto.nombre} agregado al carrito 🛒`, 'success');
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }
    if (nuevaCantidad > CANTIDAD_MAXIMA) {
        mostrarToast(`Máximo ${CANTIDAD_MAXIMA} unidades por producto`, 'warning');
        return;
    }

    item.cantidad = nuevaCantidad;
    actualizarCarrito();
}

function fijarCantidad(id, valor) {
    let nuevaCantidad = Number(valor);

    if (!Number.isFinite(nuevaCantidad) || nuevaCantidad < 1) {
        nuevaCantidad = 1;
    }
    if (nuevaCantidad > CANTIDAD_MAXIMA) {
        nuevaCantidad = CANTIDAD_MAXIMA;
        mostrarToast(`Máximo ${CANTIDAD_MAXIMA} unidades por producto`, 'warning');
    }

    carrito = carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    );
    actualizarCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    const confirmado = confirm('¿Seguro que deseas vaciar el carrito?');
    if (!confirmado) return;
    carrito = [];
    actualizarCarrito();
}

/* ---------- 4) Render: badge del carrito (visible en TODAS las páginas) ---------- */
function actualizarBadgeCarrito() {
    const badge = document.querySelector('#cart-badge');
    if (!badge) return;

    const totalUnidades = calcularUnidades(carrito);
    badge.textContent = totalUnidades;
    badge.style.display = totalUnidades > 0 ? 'inline-block' : 'none';
}

/* ---------- 4) Render: página Carrito.html (con imagen de producto) ---------- */
function renderCarrito() {
    const contenedor = document.querySelector('#carrito-contenido');
    const resumen = document.querySelector('#carrito-resumen');
    if (!contenedor || !resumen) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-5">
                <div class="display-1 mb-3">🛒</div>
                <h4 class="fw-bold">Tu carrito está vacío</h4>
                <p class="text-muted">Agrega productos desde nuestra página de Productos.</p>
                <a href="Productos.html" class="btn btn-custom mt-2">Ver Productos</a>
            </div>`;
        resumen.innerHTML = '';
        return;
    }

    let filas = '';
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        filas += `
            <tr>
                <td class="align-middle">
                    <div class="d-flex align-items-center gap-2">
                        <img src="${item.imagen}" alt="${item.nombre}" style="width:56px;height:56px;object-fit:contain;">
                        <strong>${item.nombre}</strong>
                    </div>
                </td>
                <td class="align-middle">${formatearCLP(item.precio)}</td>
                <td class="align-middle" style="max-width:150px;">
                    <div class="d-flex align-items-center gap-1">
                        <button class="btn btn-sm btn-outline-secondary btn-restar" data-id="${item.id}" type="button">−</button>
                        <input type="number" min="1" max="${CANTIDAD_MAXIMA}" value="${item.cantidad}"
                            class="form-control form-control-custom form-control-sm text-center input-cantidad"
                            data-id="${item.id}">
                        <button class="btn btn-sm btn-outline-secondary btn-sumar" data-id="${item.id}" type="button">+</button>
                    </div>
                </td>
                <td class="align-middle fw-bold">${formatearCLP(subtotal)}</td>
                <td class="align-middle">
                    <button class="btn btn-outline-danger btn-sm btn-eliminar" data-id="${item.id}" type="button">✕</button>
                </td>
            </tr>`;
    });

    contenedor.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle mb-3">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
        <button class="btn btn-outline-secondary btn-sm" id="btn-vaciar" type="button">Vaciar carrito</button>`;

    const total = calcularTotal(carrito);
    resumen.innerHTML = `
        <div class="card card-custom p-4">
            <h4 class="fw-bold mb-3">Resumen del pedido</h4>
            <div class="d-flex justify-content-between mb-2">
                <span>Productos (${calcularUnidades(carrito)})</span>
                <span>${formatearCLP(total)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Envío</span>
                <span class="text-success fw-semibold">Gratis</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total</span>
                <span>${formatearCLP(total)}</span>
            </div>
            <button class="btn btn-custom w-100 py-2 fw-bold" id="btn-proceder" type="button">Proceder al Pedido 🔥</button>
            <div id="checkout-alert" class="mt-3"></div>
        </div>`;
}

/* ---------- Validación al proceder al pedido ---------- */
function procederAlPedido() {
    const alertBox = document.querySelector('#checkout-alert');
    if (!alertBox) return;

    if (carrito.length === 0) {
        alertBox.innerHTML = `<div class="alert alert-warning py-2 mb-0">Tu carrito está vacío.</div>`;
        return;
    }

    const total = calcularTotal(carrito);
    if (total <= 0) {
        alertBox.innerHTML = `<div class="alert alert-danger py-2 mb-0">Hubo un problema con el total del pedido.</div>`;
        return;
    }

    localStorage.setItem('gasexpress_pedido_actual', JSON.stringify({ carrito, total }));

    alertBox.innerHTML = `<div class="alert alert-success py-2 mb-0">¡Pedido confirmado! Redirigiendo a contacto...</div>`;
    setTimeout(() => { window.location.href = 'Contacto.html'; }, 1200);
}

/* ---------- Toast de confirmación ---------- */
function mostrarToast(mensaje, tipo = 'success') {
    let contenedor = document.querySelector('#toast-container');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'toast-container';
        document.body.appendChild(contenedor);
    }

    const colores = {
        success: 'var(--fuchsia-main, #D81B60)',
        warning: '#B8860B',
        danger: '#B00020'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-carrito';
    toast.style.background = colores[tipo] || colores.success;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}


document.addEventListener('click', event => {
    const target = event.target;

    if (target.classList.contains('btn-agregar-carrito')) {
        const producto = {
            id: Number(target.dataset.id),
            nombre: target.dataset.nombre,
            precio: Number(target.dataset.precio),
            imagen: target.dataset.imagen
        };
        agregarAlCarrito(producto);
        return;
    }

    if (target.classList.contains('btn-eliminar')) {
        eliminarDelCarrito(Number(target.dataset.id));
        return;
    }
    if (target.classList.contains('btn-sumar')) {
        cambiarCantidad(Number(target.dataset.id), 1);
        return;
    }
    if (target.classList.contains('btn-restar')) {
        cambiarCantidad(Number(target.dataset.id), -1);
        return;
    }
    if (target.id === 'btn-vaciar') {
        vaciarCarrito();
        return;
    }
    if (target.id === 'btn-proceder') {
        procederAlPedido();
        return;
    }
});

document.addEventListener('change', event => {
    if (event.target.classList.contains('input-cantidad')) {
        fijarCantidad(Number(event.target.dataset.id), event.target.value);
    }
});

/* ---------- Inicialización al cargar cada página ---------- */
document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeCarrito();
    renderCarrito();
});
