/**
 * Centralized error handler for Axios requests.
 * 
 * Extracts user-friendly error messages from:
 * 1. Backend `errores[]` array format  → "error1, error2"
 * 2. Backend `mensaje` string          → direct message
 * 3. Standard `message` field          → direct message
 * 4. HTTP status fallback              → generic status message
 * 5. Network/request errors            → connection messages
 * 
 * @param {Error} error - The error object from Axios.
 * @returns {string} A user-friendly error message.
 */
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    // 1. Backend errores[] array (e.g. { errores: ["nombre requerido", "correo inválido"] })
    if (data?.errores && Array.isArray(data.errores)) {
      return data.errores.join(', ');
    }

    // 2. Backend mensaje string (e.g. { mensaje: "Ruta no encontrada" })
    if (data?.mensaje) {
      return data.mensaje;
    }

    // 3. Standard message field
    if (data?.message) {
      return data.message;
    }

    // 4. Status-based fallback
    switch (status) {
      case 400:
        return 'Solicitud inválida. Verifica los datos e intenta de nuevo.';
      case 401:
        return 'No autorizado. Verifica tus credenciales.';
      case 403:
        return 'Acceso denegado. No tienes permiso para esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto. El recurso ya existe.';
      case 429:
        return 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.';
      case 500:
        return 'Error interno del servidor. Intenta de nuevo más tarde.';
      case 502:
        return 'El servidor no está disponible. Intenta de nuevo más tarde.';
      case 503:
        return 'Servicio temporalmente no disponible.';
      default:
        return `Error del servidor (${status}). Intenta de nuevo.`;
    }
  } else if (error.request) {
    // No response received — network/connection issue
    return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
  } else {
    // Request setup error
    return error.message || 'Ocurrió un error inesperado.';
  }
};

export default handleError;
