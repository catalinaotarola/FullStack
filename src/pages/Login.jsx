import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { sesion, ingresar, registrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde ?? '/';

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errorLogin, setErrorLogin] = useState('');
  const [regForm, setRegForm] = useState({ nombre: '', email: '', password: '' });
  const [errorReg, setErrorReg] = useState('');
  const [exitoReg, setExitoReg] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el formulario: redirige directo.
  if (sesion) return <Navigate to={destino} replace />;

  function enviarLogin(evento) {
    evento.preventDefault();
    if (ingresar(loginForm.email, loginForm.password)) navigate(destino, { replace: true });
    else setErrorLogin('Correo o contraseña incorrectos.');
  }

  function enviarRegistro(evento) {
    evento.preventDefault();
    const resultado = registrar(regForm);
    if (resultado.ok) {
      setExitoReg(true);
      setErrorReg('');
      setRegForm({ nombre: '', email: '', password: '' });
    } else {
      setErrorReg(resultado.error);
    }
  }

  return (
    <Container as="section" className="py-4">
      <Row className="g-4">
        <Col md={6}>
          <h2>Iniciar sesión</h2>
          <Form onSubmit={enviarLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
            </Form.Group>
            {errorLogin && <Alert variant="danger">{errorLogin}</Alert>}
            <Button type="submit">Ingresar</Button>
          </Form>
          <p className="text-muted mt-3 small">
            Cuenta de administrador de prueba: <strong>admin@gasexpress.cl</strong> / <strong>Admin@123</strong>
          </p>
        </Col>
        <Col md={6}>
          <h2>Crear cuenta</h2>
          <Form onSubmit={enviarRegistro}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={regForm.nombre}
                onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required />
            </Form.Group>
            {errorReg && <Alert variant="danger">{errorReg}</Alert>}
            {exitoReg && <Alert variant="success">¡Cuenta creada! Ahora puedes iniciar sesión.</Alert>}
            <Button type="submit">Registrarme</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
