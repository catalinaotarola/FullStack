import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { productosIniciales } from '../data/productosIniciales.js';
import { cargarEstado, guardarEstado } from '../service/storage.js';
import { tiendaReducer } from '../store/tiendaReducer.js';

const TiendaContext = createContext(null);

export function TiendaProvider({ children }) {
  // useReducer(reducer, argInicial, funcionQueArmaElEstadoInicial)
  // El 3er argumento se ejecuta UNA sola vez, al montar, para leer localStorage.
  const [estado, dispatch] = useReducer(tiendaReducer, null, () => cargarEstado(productosIniciales));
  const [errorGuardado, setErrorGuardado] = useState(false);

  // Cada vez que "estado" cambia (por cualquier dispatch), lo guardamos en localStorage.
  useEffect(() => {
    setErrorGuardado(!guardarEstado(estado));
  }, [estado]);

  return (
    <TiendaContext.Provider value={{ estado, dispatch, errorGuardado }}>
      {children}
    </TiendaContext.Provider>
  );
}

// Hook para que cualquier componente lea/modifique el estado compartido
export function useTienda() {
  const contexto = useContext(TiendaContext);
  if (!contexto) throw new Error('useTienda debe usarse dentro de TiendaProvider.');
  return contexto;
}
