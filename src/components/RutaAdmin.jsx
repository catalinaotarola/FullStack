import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

// "Guardia" de la ruta /admin: si no hay sesión de admin, redirige a /login
// guardando en el state la ruta que se quería visitar, para volver ahí después.
export default function RutaAdmin() {
  const { sesion } = useAuth();
  const location = useLocation();
  return sesion?.esAdmin
    ? <Outlet />
    : <Navigate to="/login" replace state={{ desde: location.pathname }} />;
}
