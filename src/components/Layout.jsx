
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useTienda } from '../context/TiendaContext.jsx';

const TITULOS = {
  '/': 'Inicio',
  '/productos': 'Productos',
  '/carrito': 'Carrito',
  '/contacto': 'Contacto',
  '/login': 'Ingreso',
  '/admin': 'Administración',
};

export default function Layout() {
  const { estado, dispatch, errorGuardado } = useTienda();
  const { pathname } = useLocation();
  const main = useRef(null);

  useEffect(() => {
    document.title = `${TITULOS[pathname] ?? 'Página no encontrada'} | GasExpress`;

    // Evita que enfocar el contenido desplace la página.
    main.current?.focus({ preventScroll: true });

    // Vuelve arriba al cambiar de sección.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return (
    <>
      <a className="visually-hidden-focusable" href="#contenido">
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido" tabIndex={-1} ref={main}>
        <Container>
          {errorGuardado && (
            <Alert variant="warning">
              No se pudo guardar en este navegador. Los cambios funcionan
              mientras esta página permanezca abierta.
            </Alert>
          )}

          {estado.aviso && (
            <Alert
              variant={estado.aviso.tipo}
              dismissible
              onClose={() => dispatch({ type: 'CERRAR_AVISO' })}
              role="status"
            >
              {estado.aviso.texto}
            </Alert>
          )}
        </Container>

        <Outlet />
      </main>

      <Footer />
    </>
  );
}
