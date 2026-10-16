import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { useTienda } from '../context/TiendaContext.jsx';
import ProductoCard from '../components/ProductoCard.jsx';

export default function Productos() {
  const { estado } = useTienda();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  const categorias = [...new Set(estado.productos.map((p) => p.categoria))];

  const filtrados = estado.productos.filter((p) => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !categoria || p.categoria === categoria;
    const coincidePrecio = !precioMax || p.precio <= Number(precioMax);
    return coincideNombre && coincideCategoria && coincidePrecio;
  });

  return (
    <Container as="section" className="py-4">
      <h1>Catálogo</h1>
      <Row className="g-2 mb-4">
        <Col md={4}>
          <Form.Control
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="number"
            placeholder="Precio máximo"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
          />
        </Col>
      </Row>
      {!filtrados.length ? (
        <p>No hay productos que coincidan con el filtro.</p>
      ) : (
        <Row className="g-3">
          {filtrados.map((producto) => (
            <Col sm={6} md={4} lg={3} key={producto.id}>
              <ProductoCard producto={producto} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
