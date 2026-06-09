'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle, Download, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { scheduleCopy } from '@/lib/api';

interface ImportBannerProps {
  uo: string;
  onDismiss: () => void;
}

type State = 'idle' | 'loading' | 'success' | 'error';

function removeImportParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete('import');
  window.history.replaceState(null, '', url.toString());
}

export function ImportBanner({ uo, onDismiss }: ImportBannerProps) {
  const t = useTranslations('schedule');
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [visible, setVisible] = useState(true);

  // After success, auto-dismiss after 3 s
  useEffect(() => {
    if (state !== 'success') return;
    const timer = setTimeout(() => dismiss(), 3000);
    return () => clearTimeout(timer);
     
  }, [state]);

  function dismiss() {
    setVisible(false);
    removeImportParam();
    setTimeout(() => onDismiss(), 200);
  }

  async function handleCopy() {
    if (!user) return;
    setState('loading');
    try {
      await scheduleCopy(uo);
      setState('success');
      removeImportParam();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('importError'));
      setState('error');
    }
  }

  function handleLogin() {
    try {
      localStorage.setItem('returnUrl', window.location.href);
    } catch {
      // localStorage not available
    }
    router.push('/auth/login');
  }

  const isProcessing = state === 'idle' || state === 'loading';

  return (
    <div
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease-out' }}
      className="border-b border-accent bg-accent-subtle"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap px-4 py-3 md:px-6">

        {/* Not authenticated */}
        {!user && (
          <>
            <LogIn size={15} className="text-accent shrink-0" aria-hidden />
            <span className="text-sm text-primary flex-1">{t('importLoginText')}</span>
            <Button variant="secondary" size="sm" onClick={handleLogin}>
              {t('importLoginButton')}
            </Button>
          </>
        )}

        {/* Authenticated — idle or loading */}
        {user && isProcessing && (
          <>
            <Download size={15} className="text-accent shrink-0" aria-hidden />
            <span className="text-sm text-primary flex-1">
              {t('importCopyQuestion', { uo })}
            </span>
            <Button
              variant="primary"
              size="sm"
              loading={state === 'loading'}
              onClick={handleCopy}
            >
              {t('importCopyButton')}
            </Button>
            <Button variant="ghost" size="sm" disabled={state === 'loading'} onClick={dismiss}>
              {t('importIgnore')}
            </Button>
          </>
        )}

        {/* Success */}
        {user && state === 'success' && (
          <>
            <CheckCircle size={15} className="text-success shrink-0" aria-hidden />
            <span className="text-sm text-primary flex-1">{t('importSuccess')}</span>
          </>
        )}

        {/* Error */}
        {user && state === 'error' && (
          <>
            <AlertCircle size={15} className="text-error shrink-0" aria-hidden />
            <span className="text-sm text-error flex-1">{errorMsg}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setState('idle'); setErrorMsg(''); }}
            >
              {t('importRetry')}
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
