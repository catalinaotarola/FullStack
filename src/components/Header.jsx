
import { Link, NavLink, useNavigate } from 'react-router';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useTienda } from '../context/TiendaContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { resumenCarrito } from '../store/tiendaReducer.js';

export default function Header() {
  const { estado } = useTienda();
  const { sesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate('/', { replace: true });
  }

  return (
    <header>
      <Navbar expand="lg" data-bs-theme="dark" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/" className="marca-gasexpress">
            <span className="logo-gas">Gas</span>Express
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="menu-principal"
            aria-label="Abrir navegación"
          />

          <Navbar.Collapse id="menu-principal">
            <Nav
              className="ms-auto align-items-lg-center"
              aria-label="Navegación principal"
            >
              <Nav.Link as={NavLink} to="/" end>
                Inicio
              </Nav.Link>

              <Nav.Link as={NavLink} to="/productos">
                Productos
              </Nav.Link>

              <Nav.Link as={NavLink} to="/carrito">
                Carrito
                <span className="cart-badge">
                  {resumenCarrito(estado).unidades}
                </span>
              </Nav.Link>

              <Nav.Link as={NavLink} to="/contacto">
                Contacto
              </Nav.Link>

              {sesion?.esAdmin && (
                <Nav.Link as={NavLink} to="/admin">
                  Admin
                </Nav.Link>
              )}

              {sesion ? (
                <Button
                  variant="outline-light"
                  size="sm"
                  className="ms-lg-2"
                  onClick={salir}
                >
                  Cerrar sesión ({sesion.nombre.split(' ')[0]})
                </Button>
              ) : (
                <Nav.Link as={NavLink} to="/login">
                  Iniciar Sesión
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
