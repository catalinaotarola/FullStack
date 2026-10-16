import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// Modal genérico de "¿estás seguro?". Se reutiliza en Carrito (vaciar/comprar)
// y en Admin (eliminar producto).
export default function ConfirmarModal({ abierto, titulo, confirmar, cancelar, children }) {
  return (
    <Modal show={abierto} onHide={cancelar} centered>
      <Modal.Header closeButton><Modal.Title>{titulo}</Modal.Title></Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cancelar}>Cancelar</Button>
        <Button variant="danger" onClick={confirmar}>Confirmar</Button>
      </Modal.Footer>
    </Modal>
  );
}
