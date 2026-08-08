'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authLogin } from '@/lib/api/auth';

function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const resetOk = searchParams.get('reset') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = t('errorRequired');
    else if (!email.endsWith('@uniovi.es')) errs.email = t('errorEmailDomain');
    if (!password) errs.password = t('errorRequired');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await authLogin(email, password);
      queryClient.removeQueries({ queryKey: ['me'] });
      let redirectTo = '/';
      try {
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
          localStorage.removeItem('returnUrl');
          redirectTo = returnUrl;
        }
      } catch {
        // localStorage not available
      }
      router.push(redirectTo);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-xl font-semibold text-primary text-center mb-8">
        {t('loginTitle')}
      </h1>

      {resetOk && (
        <p
          role="status"
          className="mb-4 text-sm text-success bg-success-subtle border border-success rounded-sm px-3 py-2 text-center"
        >
          {t('resetSuccess')}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label={t('emailLabel')}
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          label={t('passwordLabel')}
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          rightAction={
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              onClick={() => setShowPassword((v) => !v)}
              className="text-tertiary hover:text-secondary transition-colors transition-fast"
            >
              {showPassword ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
            </button>
          }
        />

        {apiError && (
          <div
            role="alert"
            className="text-sm text-error bg-error-subtle border border-error rounded-sm px-3 py-2"
          >
            {apiError}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/auth/recover"
            className="text-sm text-secondary hover:text-primary"
          >
            {t('forgotPassword')}
          </Link>
          <Button type="submit" loading={loading}>
            {t('loginSubmit')}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        {t('noAccount')}{' '}
        <Link
          href="/auth/register"
          className="text-accent hover:text-accent-hover font-medium"
        >
          {t('register')}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
