import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';
import ProductoModal from '../components/ProductoModal.jsx';
import ConfirmarModal from '../components/ConfirmarModal.jsx';
import { precioCLP, estadoStock } from '../utils/formatos.js';
import { useTienda } from '../context/TiendaContext.jsx';

export default function Admin() {
  const { estado, dispatch } = useTienda();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const productos = estado.productos;

  function crear() { setEditando(null); setModal(true); }
  function editar(producto) { setEditando(producto); setModal(true); }
  function guardar(datos, id) {
    dispatch({ type: 'GUARDAR_PRODUCTO', datos, id });
    setModal(false);
  }
  function confirmarEliminar() {
    dispatch({ type: 'ELIMINAR_PRODUCTO', id: eliminando.id });
    setEliminando(null);
  }

  const resumen = [
    { titulo: 'Productos', valor: productos.length },
    { titulo: 'Unidades de stock', valor: productos.reduce((t, p) => t + p.stock, 0) },
    { titulo: 'Categorías', valor: new Set(productos.map((p) => p.categoria)).size },
  ];

  return (
    <Container as="section" className="py-4">
      <h1>Administración de productos</h1>
      <Row className="g-3 mb-4">
        {resumen.map((r) => (
          <Col sm={4} key={r.titulo}>
            <Card><Card.Body>
              <h2 className="h6">{r.titulo}</h2>
              <strong className="fs-3">{r.valor}</strong>
            </Card.Body></Card>
          </Col>
        ))}
      </Row>
      <Button className="mb-3" onClick={crear}>+ Nuevo producto</Button>
      <Table responsive striped hover>
        <thead>
          <tr>{['ID', 'Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {productos.length ? productos.map((p) => {
            const stock = estadoStock(p.stock);
            return (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><img className="rounded me-2" src={p.imagen} alt="" width={32} height={32} style={{ objectFit: 'cover' }} />{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{precioCLP(p.precio)}</td>
                <td>{p.stock}</td>
                <td><Badge bg={stock.variante}>{stock.texto}</Badge></td>
                <td className="text-nowrap">
                  <Button size="sm" variant="warning" onClick={() => editar(p)}>Editar</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => setEliminando(p)}>Eliminar</Button>
                </td>
              </tr>
            );
          }) : <tr><td colSpan={7}>No hay productos registrados.</td></tr>}
        </tbody>
      </Table>
      {modal && (
        <ProductoModal producto={editando} productos={productos} guardar={guardar} cerrar={() => setModal(false)} />
      )}
      <ConfirmarModal
        abierto={eliminando !== null}
        titulo="Eliminar producto"
        confirmar={confirmarEliminar}
        cancelar={() => setEliminando(null)}
      >
        ¿Eliminar {eliminando?.nombre}? También se retirará del carrito si está agregado.
      </ConfirmarModal>
    </Container>
  );
}
