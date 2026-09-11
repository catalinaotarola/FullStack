/* ============================================================
   COMPONENTES.JS - Navbar reutilizable (GasExpress)
   ------------------------------------------------------------
   En vez de repetir el <nav> completo en cada página y arriesgar
   que queden desincronizados, el <nav id="navbar-gasexpress"></nav>
   se deja vacío en el HTML y este archivo lo construye una sola
   vez al cargar cualquier página. Incluye el slot de cuenta
   (login/usuario) y el ícono de carrito con su badge.
   ============================================================ */

function paginaActual() {
    const ruta = window.location.pathname.split('/').pop();
    return ruta === '' ? 'Index.html' : ruta;
}

function claseActiva(pagina) {
    return paginaActual() === pagina ? 'active' : '';
}

function renderNavbar() {
    const nav = document.querySelector('#navbar-gasexpress');
    if (!nav) return; // la página no usa el navbar dinámico

    nav.className = 'navbar navbar-expand-lg navbar-dark sticky-top';
    nav.innerHTML = `
        <div class="container">
            <a class="navbar-brand fw-bold" href="Index.html"> <span class="logo-gas">Gas</span>Express</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-lg-center">
                    <li class="nav-item"><a class="nav-link ${claseActiva('Index.html')}" href="Index.html">Inicio</a></li>
                    <li class="nav-item"><a class="nav-link ${claseActiva('Productos.html')}" href="Productos.html">Productos</a></li>
                    <li class="nav-item"><a class="nav-link ${claseActiva('Contacto.html')}" href="Contacto.html">Contacto</a></li>
                    <li class="nav-item" id="nav-cuenta">
                        <a class="nav-link ${claseActiva('Login.html')}" href="Login.html">Iniciar Sesión</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link position-relative ${claseActiva('Carrito.html')}" href="Carrito.html">
                            🛒 Carrito
                            <span id="cart-badge" class="badge rounded-pill" style="display:none;">0</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>`;
}

document.addEventListener('DOMContentLoaded', renderNavbar);
