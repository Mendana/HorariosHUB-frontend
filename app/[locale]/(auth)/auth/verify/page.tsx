'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { authVerify } from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

function VerifyContent() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
  
    const verify = async () => {
      if (!token) {
        setErrorMsg(t('errorNoToken'));
        setStatus('error');
        return;
      }
      try {
        await authVerify(token);
        setStatus('success');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : t('verifyError'));
        setStatus('error');
      }
    };
  
    verify();
     
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 text-secondary">
        <Loader2 size={36} className="animate-spin" aria-hidden />
        <p className="text-sm">{t('verifyLoading')}</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4">
        <CheckCircle size={40} className="text-success" aria-hidden />
        <p className="text-sm font-medium text-primary">{t('verifySuccess')}</p>
        <Link
          href="/auth/login"
          className="text-sm text-accent hover:text-accent-hover font-medium"
        >
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <XCircle size={40} className="text-error" aria-hidden />
      <p className="text-sm text-error">{errorMsg || t('verifyError')}</p>
      <Link
        href="/auth/login"
        className="text-sm text-accent hover:text-accent-hover font-medium"
      >
        {t('backToLogin')}
      </Link>
    </div>
  );
}

function LoadingFallback() {
  const t = useTranslations('auth');
  return (
    <div className="flex flex-col items-center gap-3 text-secondary">
      <Loader2 size={36} className="animate-spin" aria-hidden />
      <p className="text-sm">{t('verifyLoading')}</p>
    </div>
  );
}

export default function VerifyPage() {
  const t = useTranslations('auth');
  return (
    <div className="w-full max-w-sm text-center">
      <h1 className="text-xl font-semibold text-primary mb-8">
        {t('verifyTitle')}
      </h1>
      <Suspense fallback={<LoadingFallback />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
