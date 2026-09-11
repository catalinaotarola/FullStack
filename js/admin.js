/*PANEL DE ADMIN
+
OPERACIONES CRUD COMPLETAS.*/
const tablaProductos = document.querySelector('#tablaProductos');
const elTotalProductos = document.querySelector('#totalProductos');
const elTotalStock = document.querySelector('#totalStock');
const elTotalCategorias = document.querySelector('#totalCategorias');
const formularioProducto = document.querySelector('#formularioProducto');
const formProducto = document.querySelector('#formProducto');
const btnNuevoProducto = document.querySelector('#btnNuevoProducto');
const btnCancelar = document.querySelector('#btnCancelar');
const btnCerrarSesionAdmin = document.querySelector('#btnCerrarSesionAdmin');

// Estado: qué producto se está editando (o ninguno)
let productoEditandoId = null;


   // Renderizar la tabla de productos

function renderTablaAdmin() {
    if (!tablaProductos) return;

    const productos = obtenerProductos();
    tablaProductos.innerHTML = '';

    if (productos.length === 0) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    No hay productos registrados.
                </td>
            </tr>`;
    }

    productos.forEach(producto => {
        tablaProductos.innerHTML += `
            <tr>
                <td>${producto.id}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${producto.imagen}" alt="${producto.nombre}"
                            width="55" height="55" class="rounded" style="object-fit:cover;">
                        <span>${producto.nombre}</span>
                    </div>
                </td>
                <td><span class="badge text-bg-secondary">${producto.categoria}</span></td>
                <td>${formatearCLP(producto.precio)}</td>
                <td>
                    <span class="badge ${Number(producto.stock) === 0 ? 'text-bg-danger' : 'text-bg-success'}">
                        ${producto.stock}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-2 flex-wrap">
                        <button type="button" class="btn btn-warning btn-sm btn-editar" data-id="${producto.id}">✏️ Editar</button>
                        <button type="button" class="btn btn-danger btn-sm btn-eliminar" data-id="${producto.id}">🗑️ Eliminar</button>
                    </div>
                </td>
            </tr>`;
    });

    actualizarResumenAdmin();
}

//total productos, stock, categorías
function actualizarResumenAdmin() {
    const productos = obtenerProductos();

    if (elTotalProductos) elTotalProductos.textContent = productos.length;

    const stockTotal = productos.reduce((total, p) => total + Number(p.stock), 0);
    if (elTotalStock) elTotalStock.textContent = stockTotal;

    const categorias = new Set(productos.map(p => p.categoria));
    if (elTotalCategorias) elTotalCategorias.textContent = categorias.size;
}

 //  Mostrar / ocultar el formulario
 
function mostrarFormularioAdmin() {
    if (formularioProducto) formularioProducto.classList.remove('d-none');
}

function ocultarFormularioAdmin() {
    if (!formularioProducto) return;

    formularioProducto.classList.add('d-none');
    if (formProducto) formProducto.reset();
    productoEditandoId = null;

    const titulo = formularioProducto.querySelector('.card-header h2');
    if (titulo) titulo.textContent = 'Agregar producto';
}

// Botón "+ Nuevo producto
if (btnNuevoProducto) {
    btnNuevoProducto.addEventListener('click', () => {
        productoEditandoId = null;
        if (formProducto) formProducto.reset();

        const titulo = formularioProducto.querySelector('.card-header h2');
        if (titulo) titulo.textContent = 'Agregar producto';

        mostrarFormularioAdmin();
        formularioProducto.scrollIntoView({ behavior: 'smooth' });
    });
}

// Botón "Cancelar"  
if (btnCancelar) {
    btnCancelar.addEventListener('click', ocultarFormularioAdmin);
}

/* 
   CREATE / UPDATE - Envío del formulario
 */
if (formProducto) {
    formProducto.addEventListener('submit', event => {
        event.preventDefault();

        const nombre = document.querySelector('#nombreProducto').value.trim();
        const categoria = document.querySelector('#categoriaProducto').value.trim();
        const precio = Number(document.querySelector('#precioProducto').value);
        const stock = Number(document.querySelector('#stockProducto').value);
        const imagen = document.querySelector('#imagenProducto').value.trim();
        const descripcion = document.querySelector('#descripcionProducto').value.trim();
        const destacado = document.querySelector('#destacadoProducto').checked;

        /* ---------- Validaciones u.u ---------- */
        if (!nombre) {
            alert('Debes ingresar un nombre.');
            return;
        }
        if (!categoria) {
            alert('Debes ingresar una categoría.');
            return;
        }
        if (isNaN(precio) || precio <= 0) {
            alert('El precio no es válido.');
            return;
        }
        if (isNaN(stock) || stock < 0) {
            alert('El stock no es válido.');
            return;
        }
        if (!imagen) {
            alert('Debes ingresar una ruta o URL de imagen.');
            return;
        }

        const productos = obtenerProductos();

        /* ---------- UPDATE: había un id en edición ---------- */
        if (productoEditandoId !== null) {
            const indice = productos.findIndex(p => p.id === productoEditandoId);

            if (indice !== -1) {
                productos[indice] = {
                    ...productos[indice],
                    nombre,
                    categoria,
                    precio,
                    stock,
                    imagen,
                    descripcion,
                    destacado
                };
                guardarProductos(productos);
                alert('Producto actualizado correctamente.');
            }
        }

        /* ---------- CREATE: no había id en edición ---------- */
        else {
            let nuevoId = 1;
            if (productos.length > 0) {
                nuevoId = Math.max(...productos.map(p => Number(p.id))) + 1;
            }

            productos.push({ id: nuevoId, nombre, categoria, precio, stock, imagen, descripcion, destacado });
            guardarProductos(productos);
            alert('Producto agregado correctamente.');
        }

        ocultarFormularioAdmin();
        renderTablaAdmin();
    });
}

//
 //  Botones de la tabla (Editar / Eliminar) - delegación de eventos
   
if (tablaProductos) {
    tablaProductos.addEventListener('click', event => {
        const botonEditar = event.target.closest('.btn-editar');
        if (botonEditar) {
            editarProductoAdmin(Number(botonEditar.dataset.id));
            return;
        }

        const botonEliminar = event.target.closest('.btn-eliminar');
        if (botonEliminar) {
            eliminarProductoAdmin(Number(botonEliminar.dataset.id));
        }
    });
}

/*
    - Cargar los datos del producto en el formulario
   */
function editarProductoAdmin(id) {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        alert('Producto no encontrado.');
        return;
    }

    productoEditandoId = id;

    document.querySelector('#nombreProducto').value = producto.nombre;
    document.querySelector('#categoriaProducto').value = producto.categoria;
    document.querySelector('#precioProducto').value = producto.precio;
    document.querySelector('#stockProducto').value = producto.stock;
    document.querySelector('#imagenProducto').value = producto.imagen;
    document.querySelector('#descripcionProducto').value = producto.descripcion || '';
    document.querySelector('#destacadoProducto').checked = !!producto.destacado;

    const titulo = formularioProducto.querySelector('.card-header h2');
    if (titulo) titulo.textContent = 'Editar producto';

    mostrarFormularioAdmin();
    formularioProducto.scrollIntoView({ behavior: 'smooth' });
}

/* 
   DELETE - Eliminar producto (y limpiarlo de cualquier carrito)
    */
function eliminarProductoAdmin(id) {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        alert('Producto no encontrado.');
        return;
    }

    const confirmar = confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`);
    if (!confirmar) return;

    // Se quita del catálogo
    const nuevosProductos = productos.filter(p => p.id !== id);
    guardarProductos(nuevosProductos);

    // Y también del carrito, por si algún cliente lo tenía agregado
    const carritoActual = JSON.parse(localStorage.getItem('gasexpress_carrito')) || [];
    const carritoActualizado = carritoActual.filter(item => item.id !== id);
    localStorage.setItem('gasexpress_carrito', JSON.stringify(carritoActualizado));

    renderTablaAdmin();
    alert('Producto eliminado correctamente.');
}

/* ---------- Cerrar sesión desde el panel ---------- */
if (btnCerrarSesionAdmin) {
    btnCerrarSesionAdmin.addEventListener('click', () => {
        localStorage.removeItem('gasexpress_sesion');
        window.location.href = 'Index.html';
    });
}

/* ---------- Iniciar panel ---------- */
renderTablaAdmin();
