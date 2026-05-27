import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout minimalista para las páginas de autenticación.
 * Sin topbar. Logo centrado + formulario, como indica CLAUDE.md.
 * Rutas: /auth/login, /auth/register, /auth/verify, /auth/recover, /auth/reset-password.
 */
export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4">
      {/* Logo — centrado, enlaza a home */}
      <Link
        href="/"
        aria-label="PCEO Hub"
        className="mb-10 transition-opacity transition-fast hover:opacity-75"
      >
        <span className="text-2xl font-semibold text-primary tracking-tight">PCEO</span>
        <span className="text-2xl font-normal text-accent tracking-tight">Hub</span>
      </Link>

      {children}
    </main>
  );
}
