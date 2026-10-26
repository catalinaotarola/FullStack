import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { validarProducto } from '../utils/validaciones.js';

const vacio = { nombre: '', categoria: '', precio: '', stock: '', imagen: '' };
const campos = [
  { clave: 'nombre', etiqueta: 'Nombre del producto', tipo: 'text' },
  { clave: 'categoria', etiqueta: 'Categoría', tipo: 'text' },
  { clave: 'precio', etiqueta: 'Precio', tipo: 'number' },
  { clave: 'stock', etiqueta: 'Stock', tipo: 'number' },
  { clave: 'imagen', etiqueta: 'URL de imagen', tipo: 'url' },
];

// producto === null -> modo "crear". producto con datos -> modo "editar".
export default function ProductoModal({ producto, productos, guardar, cerrar }) {
  const [form, setForm] = useState(
    producto
      ? { nombre: producto.nombre, categoria: producto.categoria, precio: String(producto.precio), stock: String(producto.stock), imagen: producto.imagen }
      : vacio,
  );
  const [errores, setErrores] = useState({});

  function enviar(evento) {
    evento.preventDefault();
    const nuevos = validarProducto(form, productos, producto?.id ?? null);
    setErrores(nuevos);
    if (!Object.keys(nuevos).length) guardar(form, producto?.id ?? null);
  }

  return (
    <Modal show onHide={cerrar} centered>
      <Modal.Header closeButton><Modal.Title>{producto ? 'Editar producto' : 'Nuevo producto'}</Modal.Title></Modal.Header>
      <Form onSubmit={enviar} noValidate>
        <Modal.Body>
          {campos.map(({ clave, etiqueta, tipo }) => (
            <Form.Group className="mb-3" key={clave} controlId={`producto-${clave}`}>
              <Form.Label>{etiqueta}</Form.Label>
              <Form.Control
                type={tipo}
                value={form[clave]}
                min={clave === 'stock' ? 0 : undefined}
                onChange={(e) => setForm((actual) => ({ ...actual, [clave]: e.target.value }))}
                isInvalid={Boolean(errores[clave])}
              />
              <Form.Control.Feedback type="invalid">{errores[clave]}</Form.Control.Feedback>
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={cerrar}>Cancelar</Button>
          <Button type="submit">Guardar producto</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
