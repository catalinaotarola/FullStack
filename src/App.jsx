
import { Route, Routes } from 'react-router';
import { TiendaProvider } from './context/TiendaContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import RutaAdmin from './components/RutaAdmin.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import Inicio from './pages/Inicio.jsx';
import Productos from './pages/Productos.jsx';
import Carrito from './pages/Carrito.jsx';
import Contacto from './pages/Contacto.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';

export default function App() {
  return (
    <TiendaProvider>
      <AuthProvider>
        <ScrollToTop />

        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="productos" element={<Productos />} />
            <Route path="carrito" element={<Carrito />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="login" element={<Login />} />

            <Route element={<RutaAdmin />}>
              <Route path="admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </AuthProvider>
    </TiendaProvider>
  );
}
