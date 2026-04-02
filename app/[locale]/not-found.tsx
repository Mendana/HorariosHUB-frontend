'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';

export default function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
      <SearchX size={48} className="text-tertiary" aria-hidden />
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-[22px] font-semibold text-primary">{t('title')}</h1>
        <p className="text-[14px] text-secondary leading-relaxed">{t('subtitle')}</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-9 px-4 text-[14px] font-medium bg-accent text-white rounded-sm btn-transition enabled:hover:brightness-[1.08]"
      >
        {t('home')}
      </Link>
    </div>
  );
}
