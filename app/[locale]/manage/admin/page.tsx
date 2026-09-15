'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { CsvImportForm } from '@/components/admin/CsvImportForm';
import { ScraperSyncButton } from '@/components/admin/ScraperSyncButton';

export default function ManageAdminPage() {
  const t = useTranslations('adminTools');
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth + role guard (admin only)
  useEffect(() => {
    if (authLoading) return;
    if (currentUser === null) {
      router.push('/auth/login');
    } else if (currentUser.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, authLoading, router]);

  // Prevent rendering while redirecting
  if (authLoading || currentUser === null || currentUser.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      <div className="pt-6 pb-5 border-b border-subtle mb-6">
        <h1 className="text-xl font-semibold text-primary leading-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">{t('subtitle')}</p>
      </div>

      <section className="rounded-md border border-subtle bg-surface-raised p-4 md:p-5 mb-6">
        <h2 className="text-base font-medium text-primary leading-tight">{t('syncTitle')}</h2>
        <p className="mt-1 mb-4 text-sm text-secondary max-w-xl">{t('syncSubtitle')}</p>
        <ScraperSyncButton />
      </section>

      <section className="rounded-md border border-subtle bg-surface-raised p-4 md:p-5">
        <h2 className="text-base font-medium text-primary leading-tight">{t('uploadTitle')}</h2>
        <p className="mt-1 mb-4 text-sm text-secondary max-w-xl">{t('uploadSubtitle')}</p>
        <CsvImportForm />
      </section>
    </div>
  );
}
