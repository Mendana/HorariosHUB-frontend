'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errors');
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
      <AlertTriangle size={48} className="text-warning" aria-hidden />
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-[22px] font-semibold text-primary">{t('title')}</h1>
        <p className="text-[14px] text-secondary leading-relaxed">{t('subtitle')}</p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-9 px-4 text-[14px] font-medium bg-accent text-white rounded-sm btn-transition enabled:hover:brightness-[1.08]"
        >
          {t('retry')}
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-4 text-[14px] font-medium bg-surface-raised border border-strong text-primary rounded-sm btn-transition"
        >
          {t('home')}
        </Link>
      </div>
      {isDev && (
        <details className="w-full max-w-2xl text-left">
          <summary className="text-[12px] text-tertiary cursor-pointer select-none">
            {t('details')}
          </summary>
          <pre className="mt-2 p-4 bg-surface-sunken rounded-md text-[12px] font-mono text-tertiary overflow-auto whitespace-pre-wrap break-all">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
        </details>
      )}
    </div>
  );
}
