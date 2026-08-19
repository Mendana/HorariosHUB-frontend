'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authResetPassword } from '@/lib/api/auth';
import { isApiError } from '@/lib/errors';

function ResetForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [apiError, setApiError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: { password?: string; confirm?: string } = {};
    if (!password) errs.password = t('errorRequired');
    else if (password.length < 8) errs.password = t('errorPasswordMin');
    else if (!/[A-Z]/.test(password)) errs.password = t('errorPasswordUpper');
    else if (!/[0-9]/.test(password)) errs.password = t('errorPasswordNumber');

    if (!confirm) errs.confirm = t('errorRequired');
    else if (password && confirm !== password) errs.confirm = t('errorPasswordMatch');

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setApiError(t('errorNoToken'));
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await authResetPassword(token, password);
      router.push('/auth/login?reset=1');
    } catch (err) {
      if (isApiError(err) && err.code === 'weak_password') {
        setErrors((prev) => ({ ...prev, password: err.message }));
      } else {
        setTokenExpired(isApiError(err) && err.code === 'token_expired');
        setApiError(err instanceof Error ? err.message : t('errorGeneric'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-xl font-semibold text-primary text-center mb-8">
        {t('resetTitle')}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          label={t('newPasswordLabel')}
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
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
        <Input
          id="confirm"
          type={showConfirm ? 'text' : 'password'}
          label={t('confirmPasswordLabel')}
          placeholder={t('confirmPasswordPlaceholder')}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          rightAction={
            <button
              type="button"
              tabIndex={-1}
              aria-label={showConfirm ? t('hidePassword') : t('showPassword')}
              onClick={() => setShowConfirm((v) => !v)}
              className="text-tertiary hover:text-secondary transition-colors transition-fast"
            >
              {showConfirm ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
            </button>
          }
        />

        {apiError && (
          <div
            role="alert"
            className="text-sm text-error bg-error-subtle border border-error rounded-sm px-3 py-2"
          >
            {apiError}
            {tokenExpired && (
              <Link
                href="/auth/recover"
                className="block mt-1 underline text-error hover:opacity-80"
              >
                {t('resetRequestNewLink')}
              </Link>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading}>
            {t('resetSubmit')}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
