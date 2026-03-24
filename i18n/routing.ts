import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'] as const,
  defaultLocale: 'es',
  // Sin prefijo de locale en la URL (p. ej. /horario en lugar de /es/horario).
  // El middleware detecta el idioma por Accept-Language o cookie NEXT_LOCALE.
  localePrefix: 'never',
});

export type Locale = (typeof routing.locales)[number];
