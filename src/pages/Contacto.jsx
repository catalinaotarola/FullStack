
import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { validarContacto } from '../utils/validaciones.js';
import { useTienda } from '../context/TiendaContext.jsx';
import { resumenCarrito, detalleCarrito } from '../store/tiendaReducer.js';
import { precioCLP } from '../utils/formatos.js';

const vacio = {
  email: '',
  direccion: '',
  asunto: '',
  mensaje: '',
};

export default function Contacto() {
  const { estado, dispatch } = useTienda();
  const detalle = detalleCarrito(estado);

  const resumenPedido = detalle.length
    ? `Pedido desde el carrito: ${detalle
        .map((p) => `${p.cantidad} x ${p.nombre}`)
        .join(', ')}. Total: ${precioCLP(resumenCarrito(estado).total)}`
    : '';

  const [campos, setCampos] = useState({
    ...vacio,
    mensaje: resumenPedido,
  });

  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  function actualizar(evento) {
    const { name, value } = evento.target;

    const siguientes = {
      ...campos,
      [name]: value,
    };

    setCampos(siguientes);
    setTocados((actual) => ({ ...actual, [name]: true }));

    const nuevosErrores = validarContacto(siguientes);

    if (!siguientes.direccion.trim()) {
      nuevosErrores.direccion = 'Ingresa tu dirección de despacho.';
    } else {
      delete nuevosErrores.direccion;
    }

    setErrores(nuevosErrores);
    setEnviado(false);
  }

  function enviar(evento) {
    evento.preventDefault();

    const nuevosErrores = validarContacto(campos);

    if (!campos.direccion.trim()) {
      nuevosErrores.direccion = 'Ingresa tu dirección de despacho.';
    } else {
      delete nuevosErrores.direccion;
    }

    setErrores(nuevosErrores);

    setTocados({
      email: true,
      direccion: true,
      asunto: true,
      mensaje: true,
    });

    if (Object.keys(nuevosErrores).length === 0) {
      const hayPedido = detalle.length > 0;

      if (hayPedido) {
        dispatch({ type: 'COMPRAR' });
      }

      setPedidoConfirmado(hayPedido);
      setEnviado(true);
      setCampos(vacio);
      setTocados({});
    }
  }

  return (
    <Container as="section" className="py-4">
      <h1>Contacto</h1>

      <p>
        Completa tus datos y tu dirección para coordinar la entrega
        de tu pedido. Este formulario valida los datos en el navegador;
        no envía correos electrónicos.
      </p>

      {enviado && (
        <Alert variant="success" role="status">
          {pedidoConfirmado
            ? '¡Pedido confirmado! Recibimos tu información y te contactaremos a la brevedad. 🔥'
            : '¡Mensaje validado con éxito!'}
        </Alert>
      )}

      <Form onSubmit={enviar} noValidate>
        <Form.Group controlId="contacto-email" className="mb-3">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={campos.email}
            onChange={actualizar}
            placeholder="ejemplo@correo.com"
            isInvalid={Boolean(tocados.email && errores.email)}
            isValid={Boolean(tocados.email && !errores.email)}
          />
          <Form.Control.Feedback type="invalid">
            {errores.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="contacto-direccion" className="mb-3">
          <Form.Label>Dirección de despacho</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={campos.direccion}
            onChange={actualizar}
            placeholder="Calle, número, comuna y departamento (si corresponde)"
            isInvalid={Boolean(tocados.direccion && errores.direccion)}
            isValid={Boolean(tocados.direccion && !errores.direccion)}
          />
          <Form.Control.Feedback type="invalid">
            {errores.direccion}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="contacto-asunto" className="mb-3">
          <Form.Label>Asunto</Form.Label>
          <Form.Control
            type="text"
            name="asunto"
            value={campos.asunto}
            onChange={actualizar}
            isInvalid={Boolean(tocados.asunto && errores.asunto)}
            isValid={Boolean(tocados.asunto && !errores.asunto)}
          />
          <Form.Control.Feedback type="invalid">
            {errores.asunto}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="contacto-mensaje" className="mb-3">
          <Form.Label>Mensaje</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            name="mensaje"
            value={campos.mensaje}
            onChange={actualizar}
            isInvalid={Boolean(tocados.mensaje && errores.mensaje)}
            isValid={Boolean(tocados.mensaje && !errores.mensaje)}
          />
          <Form.Control.Feedback type="invalid">
            {errores.mensaje}
          </Form.Control.Feedback>
        </Form.Group>

        <Button type="submit">Validar mensaje</Button>
      </Form>
    </Container>
  );
}
