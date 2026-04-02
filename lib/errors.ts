export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 401) return 'Tu sesión ha expirado. Inicia sesión.';
    if (error.status === 403) return 'No tienes permisos para esta acción.';
    if (error.status === 404) return 'El recurso solicitado no existe.';
    if (error.status === 429) return 'Demasiadas peticiones. Espera un momento.';
    if (error.status >= 500) return 'Error del servidor. Inténtalo más tarde.';
    if (error.status === 0)   return 'Sin conexión. Comprueba tu internet.';
    return error.message || 'Ha ocurrido un error inesperado.';
  }
  if (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError'))
  ) {
    return 'Sin conexión. Comprueba tu internet.';
  }
  return 'Ha ocurrido un error inesperado.';
}
