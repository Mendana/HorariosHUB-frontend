/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { MOCKS } from '@/lib/config/mocks';

export type Role = 'visitor' | 'user' | 'professor' | 'admin';

export interface AuthUser {
  email: string;
  role: Role;
}

/**
 * Hook de autenticación.
 * MOCKS.auth = true  → devuelve el usuario mockeado (cambiar la línea comentada para probar roles).
 * MOCKS.auth = false → llama a GET /api/auth/me; 401 redirige a /auth/login.
 */
export function useAuth(): { user: AuthUser | null } {
  if (MOCKS.auth) {
    // const user: AuthUser | null = null;
    // const user: AuthUser = { email: 'alumno@uniovi.es', role: 'user' };
    // const user: AuthUser = { email: 'profesor@uniovi.es', role: 'professor' };
    const user: AuthUser = { email: 'admin@uniovi.es', role: 'admin' };

    return { user };
  }

  // ── Real implementation — descomentar cuando MOCKS.auth = false ────────────
  // import { useQuery } from '@tanstack/react-query';
  // import { useRouter } from 'next/navigation';
  // import { apiFetch } from '@/lib/apiFetch';
  //
  // const router = useRouter();
  // const { data } = useQuery({
  //   queryKey: ['me'],
  //   queryFn: () => apiFetch<AuthUser>('/api/auth/me'),
  //   retry: false,
  //   throwOnError: false,
  // });
  // useEffect(() => {
  //   if (data === null) router.push('/auth/login');
  // }, [data, router]);
  // return { user: data ?? null };

  throw new Error('MOCKS.auth is false pero la implementación real no está conectada. Ver docs/CONNECTING_BACKEND.md');
}
