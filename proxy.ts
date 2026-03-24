import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Ejecutar en todas las rutas excepto archivos estáticos y rutas internas de Next.js
  matcher: ['/((?!_next|.*\\..*).*)'],
};
