import { createContext, useContext, useState } from 'react';
import { useTienda } from './TiendaContext.jsx';
import { diagnosticarEmail, validarPassword } from '../utils/validaciones.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // AuthProvider usa useTienda() por dentro -> por eso en App.jsx debe ir
  // ANIDADO dentro de <TiendaProvider>, nunca al revés.
  const { estado, dispatch } = useTienda();
  const [sesion, setSesion] = useState(null);

  function registrar({ nombre, email, password }) {
    const errorEmail = diagnosticarEmail(email);
    if (errorEmail) return { ok: false, error: errorEmail };
    if (!validarPassword(password)) {
      return { ok: false, error: 'La contraseña debe tener 6+ caracteres, una mayúscula, un número y un símbolo.' };
    }
    const yaExiste = estado.usuarios.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (yaExiste) return { ok: false, error: 'Ya existe una cuenta con este correo.' };

    dispatch({
      type: 'GUARDAR_USUARIO',
      usuario: { id: Date.now(), nombre: nombre.trim(), email: email.trim(), password, esAdmin: false },
    });
    return { ok: true };
  }

  function ingresar(email, password) {
    const usuario = estado.usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!usuario) return false;
    setSesion(usuario);
    return true;
  }

  const cerrarSesion = () => setSesion(null);

  return (
    <AuthContext.Provider value={{ sesion, ingresar, registrar, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return contexto;
}
