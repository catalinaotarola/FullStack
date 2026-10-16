// Convierte un número a formato de moneda chilena, ej: 14990 -> "$14.990"
export function precioCLP(valor) {
  return Number(valor).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

// Según el stock, devuelve el texto y el color (variante de Bootstrap) del badge
export function estadoStock(stock) {
  if (stock <= 0) return { texto: 'Agotado', variante: 'danger' };
  if (stock <= 5) return { texto: 'Pocas unidades', variante: 'warning' };
  return { texto: 'Disponible', variante: 'success' };
}
