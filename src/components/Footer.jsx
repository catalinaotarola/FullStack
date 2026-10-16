
import Container from 'react-bootstrap/Container';

export default function Footer() {
  return (
    <footer className="footer-gasexpress mt-auto">
      <Container>
        <div className="row g-4">
          <div className="col-md-7">
            <h3 className="footer-logo">
              <span>Gas</span>Express
            </h3>
            <p>
              Tu distribuidora de gas a domicilio.
              Entregamos comodidad y confianza hasta tu hogar.
            </p>
          </div>

          <div className="col-md-5">
            <h5 className="footer-titulo">Contacto</h5>
            <p className="mb-2">
              Correo: contacto@gasexpress.cl
            </p>
            <p className="mb-0">
              Servicio de despacho a domicilio
            </p>
          </div>
        </div>

        <hr className="footer-linea" />

        <p className="text-center mb-0 small">
          © {new Date().getFullYear()} GasExpress · Todos los derechos reservados
        </p>
      </Container>
    </footer>
  );
}
