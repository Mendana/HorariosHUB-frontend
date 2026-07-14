import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horarios Hub",
  description: "Horarios universitarios — Universidad de Oviedo",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
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
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'){document.documentElement.classList.add('dark')}}catch(e){}})();`,
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
