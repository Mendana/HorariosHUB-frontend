'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authRegister } from '@/lib/api/auth';

export default function RegisterPage() {
  const t = useTranslations('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const errs: { email?: string; password?: string; confirm?: string } = {};
    if (!email) errs.email = t('errorRequired');
    else if (!email.endsWith('@uniovi.es')) errs.email = t('errorEmailDomain');

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
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await authRegister(email, password);
      setSuccess(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-sm text-success bg-success-subtle border border-success rounded-sm px-4 py-3">
          {t('registerSuccess')}
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
        {t('registerTitle')}
      </h1>

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
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading}>
            {t('registerSubmit')}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        {t('hasAccount')}{' '}
        <Link
          href="/auth/login"
          className="text-accent hover:text-accent-hover font-medium"
        >
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
