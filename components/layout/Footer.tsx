'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="border-t border-subtle bg-surface-raised mt-auto">
      <div className="max-w-full px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-tertiary">
          <p>{t('footer.copyright')}</p>
          <Link
            href={`/${locale}/about`}
            className="text-secondary hover:text-primary transition-colors transition-base"
          >
            {t('footer.about')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
