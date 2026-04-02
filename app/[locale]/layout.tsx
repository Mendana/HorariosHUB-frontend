import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Topbar } from '@/components/layout/Topbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Necesario para que getTranslations() funcione en Server Components hijos.
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        {/* Skip link — visible solo al recibir foco (navegación por teclado) */}
        <a href="#main-content" className="skip-link">
          {t('a11y.skipToContent')}
        </a>
        <Topbar />
        {/*
         * pt-16: compensa la topbar fija (h-16 = 64px).
         * flex-1: permite que la página ocupe el espacio restante.
         */}
        <main id="main-content" className="flex-1 pt-16" aria-label={t('a11y.mainContent')}>
          {children}
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
