import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ConfirmarModal from '../components/ConfirmarModal.jsx';
import { precioCLP } from '../utils/formatos.js';
import { useTienda } from '../context/TiendaContext.jsx';
import { detalleCarrito, resumenCarrito } from '../store/tiendaReducer.js';

export default function Carrito() {
  const { estado, dispatch } = useTienda();
  const navigate = useNavigate();
  const [confirmacion, setConfirmacion] = useState(null); // 'compra' | 'vaciar' | null
  const detalle = detalleCarrito(estado);
  const resumen = resumenCarrito(estado);
  const stockCambio = detalle.some((p) => p.cantidad > p.stock);

  
function confirmar() {
  if (confirmacion === 'compra') {
    setConfirmacion(null);
    navigate('/contacto');
  } else {
    dispatch({ type: 'VACIAR' });
    setConfirmacion(null);
  }
}


  return (
    <Container as="section" className="py-4">
      <h1>Mi carrito</h1>
      {stockCambio && (
        <Alert variant="warning">El stock cambió. Reduce las cantidades o elimina los productos agotados.</Alert>
      )}
      {!detalle.length ? (
        <Alert variant="info">Tu carrito está vacío.</Alert>
      ) : (
        <>
          {detalle.map((p) => (
            <Card as="article" className="mb-3" key={p.id}>
              <Card.Body className="d-flex align-items-center gap-3 flex-wrap">
                <img className="cart-image rounded" src={p.imagen} alt="" style={{ width: 72, height: 72, objectFit: 'cover' }} />
                <div className="me-auto">
                  <h2 className="h6">{p.nombre}</h2>
                  <p className="mb-1">{precioCLP(p.precio)} · {p.categoria}</p>
                  <small>Stock: {p.stock}</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button variant="outline-secondary"
                    onClick={() => dispatch({ type: 'CANTIDAD', id: p.id, cantidad: Math.max(0, p.cantidad - 1) })}>−</Button>
                  <span>{p.cantidad}</span>
                  <Button variant="outline-secondary" disabled={p.cantidad >= p.stock}
                    onClick={() => dispatch({ type: 'CANTIDAD', id: p.id, cantidad: p.cantidad + 1 })}>+</Button>
                </div>
                <strong>{precioCLP(p.precio * p.cantidad)}</strong>
                <Button variant="outline-danger" onClick={() => dispatch({ type: 'QUITAR', id: p.id })}>
                  Eliminar
                </Button>
              </Card.Body>
            </Card>
          ))}
          <Card className="mb-3">
            <Card.Body>
              <p>Unidades: {resumen.unidades}</p>
              <p>Subtotal: {precioCLP(resumen.subtotal)}</p>
              <p>Envío simulado: {precioCLP(resumen.envio)}</p>
              <h2 className="h4">Total: {precioCLP(resumen.total)}</h2>
              <Button disabled={stockCambio} onClick={() => setConfirmacion('compra')}>Finalizar compra</Button>{' '}
              <Button variant="outline-danger" onClick={() => setConfirmacion('vaciar')}>Vaciar carrito</Button>
            </Card.Body>
          </Card>
        </>
      )}
      <Button as={Link} to="/productos" variant="outline-primary">Continuar comprando</Button>
      <ConfirmarModal
        abierto={confirmacion !== null}
        titulo={confirmacion === 'compra' ? 'Confirmar compra' : 'Vaciar carrito'}
        confirmar={confirmar}
        cancelar={() => setConfirmacion(null)}
      >
        {confirmacion === 'compra'
          ? 'Se descontará el stock de los productos y se vaciará el carrito.'
          : '¿Deseas retirar todos los productos del carrito?'}
      </ConfirmarModal>
    </Container>
  );
}
