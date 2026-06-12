'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authRecover } from '@/lib/api/auth';

export default function RecoverPage() {
  const t = useTranslations('auth');

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): string | undefined {
    if (!email) return t('errorRequired');
    if (!email.endsWith('@uniovi.es')) return t('errorEmailDomain');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authRecover(email);
    } catch {
      // intentionally ignored — always show generic message
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-sm text-primary bg-surface-raised border border-subtle rounded-sm px-4 py-3">
          {t('recoverSent')}
        </p>
        <p className="mt-4 text-sm text-secondary">
          <Link
            href="/auth/login"
            className="text-accent hover:text-accent-hover font-medium"
          >
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-xl font-semibold text-primary text-center mb-8">
        {t('recoverTitle')}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label={t('emailLabel')}
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoComplete="email"
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading}>
            {t('recoverSubmit')}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        <Link
          href="/auth/login"
          className="text-accent hover:text-accent-hover font-medium"
        >
          {t('backToLogin')}
        </Link>
      </p>
    </div>
  );
}
