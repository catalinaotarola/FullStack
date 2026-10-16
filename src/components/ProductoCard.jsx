
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { precioCLP, estadoStock } from '../utils/formatos.js';
import { useTienda } from '../context/TiendaContext.jsx';

export default function ProductoCard({ producto }) {
  const { dispatch } = useTienda();
  const stock = estadoStock(producto.stock);
  const sinStock = producto.stock <= 0;

  return (
    <Card className="producto-card h-100">
      <div className="producto-imagen-contenedor">
        <Card.Img
          variant="top"
          src={producto.imagen}
          alt={producto.nombre}
          className="producto-imagen"
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="producto-titulo">
          {producto.nombre}
        </Card.Title>

        <div className="mb-3">
          <Badge
            bg={stock.variante}
            className="producto-stock"
          >
            {stock.texto}
          </Badge>
        </div>

        <strong className="producto-precio mb-3">
          {precioCLP(producto.precio)}
        </strong>

        <Button
          className="producto-boton mt-auto"
          disabled={sinStock}
          onClick={() =>
            dispatch({ type: 'AGREGAR', id: producto.id })
          }
        >
          {sinStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </Card.Body>
    </Card>
  );
}
