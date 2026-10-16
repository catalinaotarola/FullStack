// Comprueba la forma general de un correo (tiene @, tiene dominio, etc.)
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim());
}

// Da un mensaje de error específico según qué parte del correo está mal.
// Devuelve null si el correo es válido.
export function diagnosticarEmail(valor) {
  const texto = String(valor).trim();
  if (texto === '') return 'El correo electrónico es obligatorio.';
  if (!texto.includes('@')) return 'Falta el símbolo "@" en tu correo electrónico.';
  if (texto.split('@').length > 2) return 'El correo no puede tener más de un "@".';
  const [usuario, dominio] = texto.split('@');
  if (usuario === '') return 'Falta el nombre antes del "@" (ej: nombre@ejemplo.com).';
  if (!dominio || !dominio.includes('.')) return 'Falta el dominio después del "@" (ej: @ejemplo.com).';
  if (dominio.endsWith('.')) return 'El correo no puede terminar en un punto.';
  if (!validarEmail(texto)) return 'Ingresa un correo electrónico con un formato válido.';
  return null;
}

// Mínimo 6 caracteres, una mayúscula, un número y un símbolo
export function validarPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
  return regex.test(String(password));
}

export function validarTelefono(telefono) {
  return /^[0-9+\s-]{7,15}$/.test(String(telefono).trim());
}

export function validarTextoMinimo(texto, minimo = 3) {
  return String(texto).trim().length >= minimo;
}

// Valida el formulario de Contacto. Devuelve un objeto { campo: 'mensaje de error' }
// Si el objeto queda vacío ({}), significa que todo está correcto.
export function validarContacto({ email, asunto, mensaje }) {
  const errores = {};
  const errorEmail = diagnosticarEmail(email);
  if (errorEmail) errores.email = errorEmail;
  if (!validarTextoMinimo(asunto, 3)) errores.asunto = 'El asunto debe tener al menos 3 caracteres.';
  if (!validarTextoMinimo(mensaje, 5)) errores.mensaje = 'Escribe un mensaje más detallado.';
  return errores;
}

// Valida el formulario de producto del panel Admin (crear/editar)
export function validarProducto({ nombre, categoria, precio, stock }, productos, idActual) {
  const errores = {};
  if (!validarTextoMinimo(nombre, 2)) errores.nombre = 'Ingresa un nombre válido.';
  if (!validarTextoMinimo(categoria, 2)) errores.categoria = 'Ingresa una categoría válida.';
  if (!precio || Number(precio) <= 0) errores.precio = 'El precio debe ser mayor a 0.';
  if (stock === '' || Number(stock) < 0) errores.stock = 'El stock no puede ser negativo.';
  const duplicado = productos.some((p) => p.id !== idActual && p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
  if (duplicado) errores.nombre = 'Ya existe un producto con ese nombre.';
  return errores;
}
