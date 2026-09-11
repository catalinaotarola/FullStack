
const USUARIOS_KEY = 'gasexpress_usuarios';
const SESION_KEY = 'gasexpress_sesion';

/* ---------- 1) Estado: se recupera desde localStorage ---------- */
let usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
let sesion = JSON.parse(localStorage.getItem(SESION_KEY)) || null;

/* ---------- 2) Persistencia centralizada ---------- */
function guardarUsuarios() {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
}

function guardarSesion() {
    if (sesion) {
        localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
    } else {
        localStorage.removeItem(SESION_KEY);
    }
}


const ADMIN_EMAIL = 'admin@gasexpress.cl';
const ADMIN_PASSWORD = 'Admin@123';

function asegurarAdminSemilla() {
    const existeAdmin = usuarios.some(u => u.email.toLowerCase() === ADMIN_EMAIL);
    if (existeAdmin) return;

    usuarios.push({
        id: Date.now(),
        nombre: 'Administrador GasExpress',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        esAdmin: true
    });
    guardarUsuarios();
}
asegurarAdminSemilla();

/* ---------- 3) Validaciones reutilizables ---------- */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email).trim());
}

/**
 * Diagnostica el email y devuelve un mensaje específico según qué falte.
 * Devuelve null si el email es válido.
 */
function diagnosticarEmail(valor) {
    const texto = String(valor).trim();

    if (texto === '') {
        return 'El correo electrónico es obligatorio.';
    }
    if (!texto.includes('@')) {
        return 'Falta el símbolo "@" en tu correo electrónico.';
    }
    if (texto.split('@').length > 2) {
        return 'El correo no puede tener más de un "@".';
    }

    const [usuario, dominio] = texto.split('@');

    if (usuario === '') {
        return 'Falta el nombre antes del "@" (ej: nombre@ejemplo.com).';
    }
    if (!dominio || !dominio.includes('.')) {
        return 'Falta el dominio después del "@" (ej: @ejemplo.com).';
    }
    if (dominio.endsWith('.')) {
        return 'El correo no puede terminar en un punto.';
    }
    if (!validarEmail(texto)) {
        return 'Ingresa un correo electrónico con un formato válido.';
    }

    return null; // válido
}

function validarPassword(password) {
    const valor = String(password);

    const tieneLargo = valor.length >= 6;
    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneNumero = /[0-9]/.test(valor);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(valor);

    return tieneLargo && tieneMayuscula && tieneNumero && tieneEspecial;
}

function validarTelefono(telefono) {
    const regex = /^[0-9+\s-]{7,15}$/;
    return regex.test(String(telefono).trim());
}

function validarTextoMinimo(texto, minimo = 3) {
    return String(texto).trim().length >= minimo;
}

function marcarInvalido(input, mensaje) {
    if (!input) return;
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback && mensaje) feedback.textContent = mensaje;
}

function marcarValido(input) {
    if (!input) return;
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}

function mostrarAlerta(contenedor, mensaje, tipo = 'danger') {
    if (!contenedor) return;
    contenedor.innerHTML = `<div class="alert alert-${tipo} py-2">${mensaje}</div>`;
}

/* ============================================================
   REGISTRO
   ============================================================ */
function manejarRegistro(event) {
    event.preventDefault();

    const form = event.target;
    const nombre = form.querySelector('#reg-nombre');
    const email = form.querySelector('#reg-email');
    const password = form.querySelector('#reg-password');
    const confirmar = form.querySelector('#reg-confirmar');
    const alertBox = document.querySelector('#registro-alert');

    let esValido = true;

    if (!validarTextoMinimo(nombre.value, 3)) {
        marcarInvalido(nombre, 'El nombre debe tener al menos 3 caracteres.');
        esValido = false;
    } else {
        marcarValido(nombre);
    }

    const errorEmail = diagnosticarEmail(email.value);
    if (errorEmail) {
        marcarInvalido(email, errorEmail);
        esValido = false;
    } else {
        marcarValido(email);
    }

    if (!validarPassword(password.value)) {
    marcarInvalido(
        password,
        'La contraseña debe tener mínimo 6 caracteres, una mayúscula, un número y un carácter especial.'
    );
    esValido = false;
    } else {
    marcarValido(password);
}

   if (!validarPassword(confirmar.value)) {
    marcarInvalido(
        confirmar,
        'La contraseña debe tener mínimo 6 caracteres, una mayúscula, un número y un carácter especial.'
    );
    esValido = false;
    } else if (confirmar.value !== password.value) {
    marcarInvalido(confirmar, 'Las contraseñas no coinciden.');
    esValido = false;
    } else {
    marcarValido(confirmar);
    }

    if (!esValido) {
        mostrarAlerta(alertBox, 'Revisa los campos marcados en rojo.', 'danger');
        return;
    }

    // Regla de negocio: no permitir correos duplicados (equivalente al "id único"
    const yaExiste = usuarios.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase());
    if (yaExiste) {
        marcarInvalido(email, 'Ya existe una cuenta con este correo.');
        mostrarAlerta(alertBox, 'Este correo ya está registrado. Intenta iniciar sesión.', 'warning');
        return;
    }

    // CREATE: se agrega el nuevo usuario al estado (equivalente a productos.push())
    usuarios.push({
        id: Date.now(),
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        password: password.value // sin backend no hay hashing real
    });
    guardarUsuarios();

    mostrarAlerta(alertBox, '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.', 'success');
    form.reset();
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

    // Cambia automáticamente a la pestaña de inicio de sesión
    setTimeout(() => {
        const tabLogin = document.querySelector('#tab-login-btn');
        if (tabLogin && window.bootstrap) new bootstrap.Tab(tabLogin).show();
    }, 1200);
}

/* ============================================================
   INICIO DE SESIÓN
   ============================================================ */
function manejarLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('#login-email');
    const password = form.querySelector('#login-password');
    const alertBox = document.querySelector('#login-alert');

    let esValido = true;

    const errorEmail = diagnosticarEmail(email.value);
    if (errorEmail) {
        marcarInvalido(email, errorEmail);
        esValido = false;
    } else {
        marcarValido(email);
    }

    if (password.value.trim() === '') {
        marcarInvalido(password, 'Ingresa tu contraseña.');
        esValido = false;
    } else {
        marcarValido(password);
    }

    if (!esValido) {
        mostrarAlerta(alertBox, 'Revisa los campos marcados en rojo.', 'danger');
        return;
    }

   
    const usuarioEncontrado = usuarios.find(
        u => u.email.toLowerCase() === email.value.trim().toLowerCase()
    );

    if (!usuarioEncontrado || usuarioEncontrado.password !== password.value) {
        mostrarAlerta(alertBox, 'Correo o contraseña incorrectos.', 'danger');
        marcarInvalido(password, 'Credenciales inválidas.');
        return;
    }

    sesion = {
        nombre: usuarioEncontrado.nombre,
        email: usuarioEncontrado.email,
        esAdmin: !!usuarioEncontrado.esAdmin
    };
    guardarSesion();

    mostrarAlerta(alertBox, `¡Bienvenida/o de nuevo, ${usuarioEncontrado.nombre}! Redirigiendo...`, 'success');
    setTimeout(() => { window.location.href = 'Index.html'; }, 1000);
}

function cerrarSesion() {
    sesion = null;
    guardarSesion();
    window.location.href = 'Index.html';
}

/* ============================================================
   4) RENDER - Estado de la cuenta en el navbar (todas las páginas)
   ============================================================ */
function renderNavCuenta() {
    const slot = document.querySelector('#nav-cuenta');
    if (!slot) return;

    if (sesion) {
        const primerNombre = sesion.nombre.split(' ')[0];

        // Si es admin, se agrega un acceso directo al panel dentro del dropdown
        const enlaceAdmin = sesion.esAdmin
            ? `<li><a class="dropdown-item" href="Admin.html">⚙️ Panel de Administración</a></li>
               <li><hr class="dropdown-divider"></li>`
            : '';

        slot.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    👤 ${primerNombre}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><span class="dropdown-item-text small text-muted">${sesion.email}</span></li>
                    <li><hr class="dropdown-divider"></li>
                    ${enlaceAdmin}
                    <li><a class="dropdown-item" href="#" id="btn-logout">Cerrar sesión</a></li>
                </ul>
            </div>`;
    } else {
        slot.innerHTML = `<a class="nav-link" href="Login.html">Iniciar Sesión</a>`;
    }
}

/* ============================================================
   VALIDACIÓN DEL FORMULARIO DE CONTACTO / PEDIDO
   ============================================================ */
function manejarContacto(event) {
    event.preventDefault();

    const form = event.target;
    const nombre = form.querySelector('#contacto-nombre');
    const telefono = form.querySelector('#contacto-telefono');
    const direccion = form.querySelector('#contacto-direccion');
    const alertBox = document.querySelector('#contacto-alert');

    let esValido = true;

    if (!validarTextoMinimo(nombre.value, 3)) {
        marcarInvalido(nombre, 'Ingresa tu nombre completo.');
        esValido = false;
    } else {
        marcarValido(nombre);
    }

    if (!validarTelefono(telefono.value)) {
        marcarInvalido(telefono, 'Ingresa un teléfono válido (7 a 15 dígitos).');
        esValido = false;
    } else {
        marcarValido(telefono);
    }

    if (!validarTextoMinimo(direccion.value, 5)) {
        marcarInvalido(direccion, 'Ingresa la dirección de entrega.');
        esValido = false;
    } else {
        marcarValido(direccion);
    }

    if (!esValido) {
        mostrarAlerta(alertBox, 'Revisa los campos marcados en rojo.', 'danger');
        return;
    }

    mostrarAlerta(alertBox, '¡Pedido enviado con éxito! Te contactaremos a la brevedad. 🔥', 'success');
    form.reset();
    form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

    // Limpiamos el pedido que veníamos arrastrando desde el carrito
    localStorage.removeItem('gasexpress_pedido_actual');
}

/**
 * Si el usuario viene desde Carrito.html con un pedido confirmado,
 * prellenamos el mensaje y el producto seleccionado.
 */
function prellenarContactoDesdeCarrito() {
    const mensaje = document.querySelector('#contacto-mensaje');
    const productoSelect = document.querySelector('#contacto-producto');
    if (!mensaje || !productoSelect) return;

    const pedidoGuardado = JSON.parse(localStorage.getItem('gasexpress_pedido_actual'));
    if (!pedidoGuardado || !pedidoGuardado.carrito || pedidoGuardado.carrito.length === 0) return;

    const resumen = pedidoGuardado.carrito
        .map(item => `${item.cantidad} x ${item.nombre}`)
        .join(', ');

    mensaje.value = `Pedido desde el carrito: ${resumen}. Total: $${pedidoGuardado.total.toLocaleString('es-CL')}`;

    // Si hay un solo tipo de producto en el carrito, lo preseleccionamos en el <select>
    if (pedidoGuardado.carrito.length === 1) {
        const nombreProducto = pedidoGuardado.carrito[0].nombre;
        const opciones = Array.from(productoSelect.options);
        const coincidencia = opciones.find(op => op.text.trim() === nombreProducto);
        if (coincidencia) productoSelect.value = coincidencia.value;
    }
}

/* ============================================================
   5) EVENTOS
   ============================================================ */
document.addEventListener('submit', event => {
    if (event.target.id === 'form-login') manejarLogin(event);
    if (event.target.id === 'form-registro') manejarRegistro(event);
    if (event.target.id === 'form-contacto') manejarContacto(event);
});

// Delegación para el botón "Cerrar sesión" (se genera dinámicamente en renderNavCuenta)
document.addEventListener('click', event => {
    if (event.target.id === 'btn-logout') {
        event.preventDefault();
        cerrarSesion();
    }
});

/* ---------- Inicialización al cargar cada página ---------- */
document.addEventListener('DOMContentLoaded', () => {
    renderNavCuenta();
    prellenarContactoDesdeCarrito();
});
