import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'PCEO Hub',
  description: 'Horarios universitarios PCEO — Universidad de Oviedo',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    /*
     * suppressHydrationWarning: el script inline añade .dark al <html>
     * antes del primer paint; React detecta el mismatch y lo suprime.
     */
    <html lang={locale} className={GeistSans.variable} suppressHydrationWarning>
      <head>
        {/*
         * Script inline sin dependencias externas: lee localStorage.theme
         * y aplica .dark al <html> ANTES del primer paint para evitar flash.
         * Si no hay preferencia guardada, usa prefers-color-scheme como
         * fallback en la primera visita.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface-base text-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
