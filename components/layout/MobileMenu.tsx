'use client';

import { Moon, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { NavLinks } from './NavLinks';
import type { AuthUser, Role } from '@/hooks/useAuth';
import type { Theme } from '@/hooks/useTheme';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser | null;
  theme: Theme;
  onToggleTheme: () => void;
}

export function MobileMenu({
  open,
  onClose,
  user,
  theme,
  onToggleTheme,
}: MobileMenuProps) {
  const t = useTranslations();

  if (!open) return null;

  const role: Role | null = user?.role ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-surface-base"
      role="dialog"
      aria-modal="true"
      aria-label={t('topbar.openMenu')}
    >
      {/* Cabecera del drawer */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-subtle shrink-0">
        <span className="text-sm font-medium text-primary">
          {t('common.appName')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('topbar.closeMenu')}
          className="p-2 rounded-sm text-secondary hover:text-primary"
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 gap-6">
        {/* Navegación */}
        <NavLinks role={role} onNavigate={onClose} vertical />

        <div aria-hidden className="border-t border-subtle" />

        {/* Toggle tema */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-3 text-sm font-medium text-secondary hover:text-primary"
        >
          {theme === 'dark' ? (
            <Sun size={18} aria-hidden />
          ) : (
            <Moon size={18} aria-hidden />
          )}
          <span>{t('topbar.toggleTheme')}</span>
        </button>

        <div aria-hidden className="border-t border-subtle" />

        {/* Perfil o login */}
        {user ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-primary truncate">{user.email}</p>
            <p className="text-xs text-secondary">{t(`roles.${user.role}`)}</p>
            <button
              type="button"
              className="mt-1 text-left text-sm text-secondary hover:text-primary"
              onClick={() => {
                onClose();
                // TODO: llamar a POST /api/auth/logout
              }}
            >
              {t('auth.logout')}
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            onClick={onClose}
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            {t('auth.login')}
          </Link>
        )}
      </div>
    </div>
  );
}
