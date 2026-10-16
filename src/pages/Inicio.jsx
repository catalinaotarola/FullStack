
import { Link } from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useTienda } from '../context/TiendaContext.jsx';
import ProductoCard from '../components/ProductoCard.jsx';

export default function Inicio() {
  const { estado } = useTienda();
  const destacados = estado.productos.filter((p) => p.destacado);

  return (
    <>
      <section className="hero py-5 text-white">
        <Container className="text-center py-4">
          <p className="hero-etiqueta">GASEXPRESS A DOMICILIO</p>

          <h1 className="display-5 fw-bold">
            Gas a domicilio, rápido y seguro
          </h1>

          <p className="lead">
            Donde estés te lo llevamos
          </p>

          <p className="hero-descripcion">
            Encuentra el cilindro ideal para tu hogar o negocio
            y disfruta de un servicio cómodo y confiable.
          </p>

          <Button
            as={Link}
            to="/productos"
            size="lg"
            variant="light"
            className="hero-boton"
          >
            Ver productos
          </Button>

          {' '}

          <Button
            as={Link}
            to="/contacto"
            size="lg"
            variant="outline-light"
            className="hero-boton-secundario"
          >
            Contactar
          </Button>
        </Container>
      </section>

      <Container as="section" className="py-5">
        <div className="text-center mb-5">
          <h2 className="titulo-seccion">
            ¿Por qué elegir GasExpress?
          </h2>
          <p>Un servicio pensado para tu comodidad.</p>
        </div>

        <Row className="g-4 mb-5">
          <Col md={4}>
            <div className="beneficio-card">
              <div className="beneficio-icono">🚚</div>
              <h3>Entrega rápida</h3>
              <p>
                Recibe tu pedido cómodamente en tu domicilio.
              </p>
            </div>
          </Col>

          <Col md={4}>
            <div className="beneficio-card">
              <div className="beneficio-icono">🛡️</div>
              <h3>Servicio confiable</h3>
              <p>
                Una experiencia de compra sencilla y segura.
              </p>
            </div>
          </Col>

          <Col md={4}>
            <div className="beneficio-card">
              <div className="beneficio-icono">💗</div>
              <h3>Precios justos</h3>
              <p>
                Diferentes opciones para tu hogar o negocio.
              </p>
            </div>
          </Col>
        </Row>

        <div className="text-center mb-4">
          <h2 className="titulo-seccion">Más vendidos</h2>
          <p>Conoce nuestros productos destacados.</p>
        </div>

        <Row className="g-4">
          {destacados.map((producto) => (
            <Col sm={6} md={4} key={producto.id}>
              <ProductoCard producto={producto} />
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5">
          <Button
            as={Link}
            to="/productos"
            className="boton-ver-catalogo"
          >
            Ver todo el catálogo
          </Button>
        </div>
      </Container>
    </>
  );
}
