import { setRequestLocale } from 'next-intl/server';
import { Topbar } from '@/components/layout/Topbar';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Necesario para que getTranslations() funcione en Server Components hijos.
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Topbar />
      {/*
       * pt-16: compensa la topbar fija (h-16 = 64px).
       * flex-1: permite que la página ocupe el espacio restante.
       */}
      <main className="flex-1 pt-16">
        {children}
      </main>
    </>
  );
}
