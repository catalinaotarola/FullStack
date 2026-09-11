
const PRODUCTOS_KEY = 'gasexpress_productos';

/* ---------- Catálogo semilla (solo se usa la primera vez) ---------- */
const productosIniciales = [
    {
        id: 1,
        nombre: 'Cilindro 2 Kg',
        categoria: 'Compacto',
        precio: 8990,
        stock: 12,
        imagen: 'img/gas2kg.jpeg',
        descripcion: 'Perfecto para llevar de camping.',
        destacado: false
    },
    {
        id: 2,
        nombre: 'Cilindro 5 Kg',
        categoria: 'Compacto',
        precio: 14990,
        stock: 10,
        imagen: 'img/gas5kg.jpeg',
        descripcion: 'Ideal para estufas pequeñas o uso moderado.',
        destacado: false
    },
    {
        id: 3,
        nombre: 'Cilindro 11 Kg',
        categoria: 'Económico',
        precio: 19990,
        stock: 20,
        imagen: 'img/gas11kg.png',
        descripcion: 'Ideal para espacios reducidos o consumo moderado.',
        destacado: true
    },
    {
        id: 4,
        nombre: 'Cilindro 15 Kg',
        categoria: 'Hogar',
        precio: 23990,
        stock: 18,
        imagen: 'img/gas15kg.jpeg',
        descripcion: 'Perfecto para la cocina y estufas del hogar diario.',
        destacado: true
    },
    {
        id: 5,
        nombre: 'Cilindro 45 Kg',
        categoria: 'Comercial',
        precio: 83990,
        stock: 6,
        imagen: 'img/gas45kg.png',
        descripcion: 'Pensado para alto consumo, calefacción o comercios.',
        destacado: false
    }
];

function obtenerProductos() {
    const guardados = localStorage.getItem(PRODUCTOS_KEY);

    // Si ya existen productos guardados se utilizaran estos.
    if (guardados) {
        return JSON.parse(guardados);
    }

    // Primera vez que se abre el sitio 
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productosIniciales));
    return productosIniciales;
}

function guardarProductos(productos) {
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
}

/* ---------- Utilidades ---------- */
function formatearCLP(numero) {
    return '$' + Number(numero).toLocaleString('es-CL');
}

/**
 * Calcula automáticamente la etiqueta de stock de un producto,
 * en vez de que el admin tenga que escribirla a mano.
 */
function badgeDeStock(stock) {
    const cantidad = Number(stock);
    if (cantidad <= 0) return { texto: 'Agotado', clase: 'badge-agotado' };
    if (cantidad <= 5) return { texto: 'Pocas unidades', clase: 'badge-pink' };
    return { texto: 'Disponible', clase: 'badge-fuchsia' };
}

/**
 * Genera el HTML de una tarjeta de producto para Index.html / Productos.html.
 */
function crearTarjetaProducto(producto) {
    const badge = badgeDeStock(producto.stock);
    const sinStock = Number(producto.stock) <= 0;

    return `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-custom text-center h-100 p-4">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <span class="badge ${badge.clase} align-self-center mb-2">${badge.texto}</span>
                <h3 class="fw-bold">${producto.nombre}</h3>
                <p class="text-muted">${producto.descripcion || ''}</p>
                <div class="price-tag my-3">${formatearCLP(producto.precio)}</div>
                <button type="button" class="btn btn-custom w-100 mt-auto btn-agregar-carrito"
                    data-id="${producto.id}"
                    data-nombre="${producto.nombre}"
                    data-precio="${producto.precio}"
                    data-imagen="${producto.imagen}"
                    ${sinStock ? 'disabled' : ''}>
                    ${sinStock ? 'Sin stock' : 'Agregar al Carrito 🛒'}
                </button>
                <a href="Contacto.html" class="btn btn-outline-secondary w-100 mt-2 btn-sm">Consultar directamente</a>
            </div>
        </div>`;
}

/**
 * Renderiza el catálogo completo (Productos.html) dentro de #contenedorProductos.
 */
function renderCatalogoCompleto() {
    const contenedor = document.querySelector('#contenedorProductos');
    if (!contenedor) return;
    contenedor.innerHTML = obtenerProductos().map(crearTarjetaProducto).join('');
}

/**
 * Renderiza solo los productos destacados (Index.html) dentro de #contenedorDestacados.
 */
function renderDestacados() {
    const contenedor = document.querySelector('#contenedorDestacados');
    if (!contenedor) return;
    const destacados = obtenerProductos().filter(producto => producto.destacado);
    contenedor.innerHTML = destacados.map(crearTarjetaProducto).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    renderCatalogoCompleto();
    renderDestacados();
});
