import type { User } from '@/lib/types/users';

// admin@uniovi.es matches the current useAuth mock — used for self-edit restriction tests
export const MOCK_USERS: User[] = [
  // ── Admins ──────────────────────────────────────────────────────────────────
  { email: 'admin@uniovi.es',           role: 'admin' },   // current user (useAuth mock)
  { email: 'uo654321@uniovi.es',        role: 'admin' },
  { email: 'uo987001@uniovi.es',        role: 'admin' },

  // ── Professors ───────────────────────────────────────────────────────────────
  { email: 'juan.garcia@uniovi.es',     role: 'profesor' },
  { email: 'maria.lopez@uniovi.es',     role: 'profesor' },
  { email: 'pedro.martinez@uniovi.es',  role: 'profesor' },
  { email: 'ana.rodriguez@uniovi.es',   role: 'profesor' },
  { email: 'carlos.sanchez@uniovi.es',  role: 'profesor' },
  { email: 'lucia.fernandez@uniovi.es', role: 'profesor' },
  { email: 'miguel.torres@uniovi.es',   role: 'profesor' },

  // ── Students ─────────────────────────────────────────────────────────────────
  { email: 'uo111111@uniovi.es',        role: 'student' },
  { email: 'uo222222@uniovi.es',        role: 'student' },
  { email: 'uo333333@uniovi.es',        role: 'student' },
  { email: 'uo444444@uniovi.es',        role: 'student' },
  { email: 'uo555555@uniovi.es',        role: 'student' },
  { email: 'uo666666@uniovi.es',        role: 'student' },
  { email: 'uo777777@uniovi.es',        role: 'student' },
  { email: 'uo888888@uniovi.es',        role: 'student' },
  { email: 'uo999999@uniovi.es',        role: 'student' },
  { email: 'uo101010@uniovi.es',        role: 'student' },
  { email: 'uo121212@uniovi.es',        role: 'student' },
  { email: 'uo131313@uniovi.es',        role: 'student' },
];
