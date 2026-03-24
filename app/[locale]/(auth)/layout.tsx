import { setRequestLocale } from 'next-intl/server';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout minimalista para las páginas de autenticación.
 * Sin topbar. El contenido se centra vertical y horizontalmente.
 * Rutas que usa este layout: /auth/login, /auth/register,
 * /auth/verify, /auth/recover, /auth/reset-password.
 */
export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4">
      {children}
    </main>
  );
}
