'use client';

export type Role = 'visitor' | 'user' | 'professor' | 'admin';

export interface AuthUser {
  email: string;
  role: Role;
}

/**
 * Hook de autenticación.
 * Por ahora devuelve un mock. null = no autenticado (visitante).
 *
 * Para probar distintos roles, descomenta la línea correspondiente.
 * TODO: conectar a GET /api/auth/me cuando esté disponible el backend.
 */
export function useAuth(): { user: AuthUser | null } {
  // const user: AuthUser | null = null;

  const user: AuthUser = { email: 'alumno@uniovi.es', role: 'user' };
  // const user: AuthUser = { email: 'profesor@uniovi.es', role: 'professor' };
  // const user: AuthUser = { email: 'admin@uniovi.es', role: 'admin' };

  return { user };
}
