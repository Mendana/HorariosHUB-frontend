export const MOCKS = {
  schedule: true,
  subjects: true,
  proposals: true,
  classes: true,
  users: true,
  events: true,
  notifications: true,
  contact: true,
} as const;

export type MockModule = keyof typeof MOCKS;

// Para activar un módulo real:
// 1. Cambia el flag a false
// 2. Asegúrate de que NEXT_PUBLIC_API_URL está configurado
// 3. El hook correspondiente usará TanStack Query automáticamente
