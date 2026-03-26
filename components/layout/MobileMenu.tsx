'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { NavLinks } from './NavLinks';
import type { AuthUser, Role } from '@/hooks/useAuth';
import type { Theme } from '@/hooks/useTheme';

const DURATION_MS = 250;

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
  const [mounted, setMounted] = useState(open);
  const [shown,   setShown]   = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    } else {
      setShown(false);
      const timer = setTimeout(() => setMounted(false), DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;

  const role: Role | null = user?.role ?? null;

  const transStyle = (extra: object) => ({
    transition: `opacity ${DURATION_MS}ms ease-in-out, transform ${DURATION_MS}ms ease-in-out`,
    ...extra,
  });

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-black/50"
        style={transStyle({ opacity: shown ? 1 : 0 })}
        onClick={onClose}
      />

      {/* Drawer panel — slides in from right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('topbar.openMenu')}
        className="absolute top-0 right-0 bottom-0 w-72 bg-surface-base border-l border-subtle flex flex-col shadow-lg"
        style={transStyle({ transform: shown ? 'translateX(0)' : 'translateX(100%)' })}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-subtle shrink-0">
          <span className="text-sm font-medium text-primary">
            {t('common.appName')}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('topbar.closeMenu')}
            className="size-9 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 gap-6">
          {/* Navigation */}
          <NavLinks role={role} onNavigate={onClose} vertical />

          <div aria-hidden className="border-t border-subtle" />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-base active:scale-[0.98]"
          >
            {theme === 'dark' ? (
              <Sun size={18} aria-hidden />
            ) : (
              <Moon size={18} aria-hidden />
            )}
            <span>{t('topbar.toggleTheme')}</span>
          </button>

          <div aria-hidden className="border-t border-subtle" />

          {/* Profile or login */}
          {user ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-primary truncate">{user.email}</p>
              <p className="text-xs text-secondary">{t(`roles.${user.role}`)}</p>
              <button
                type="button"
                className="mt-1 text-left px-3 py-2.5 rounded-sm text-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-base active:scale-[0.98]"
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
              className="block px-3 py-2.5 rounded-sm text-sm font-medium text-accent hover:bg-accent-subtle transition-[background-color,color,transform] transition-base active:scale-[0.98]"
            >
              {t('auth.login')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
