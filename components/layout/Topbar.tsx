'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NavLinks } from './NavLinks';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';

export function Topbar() {
  const t = useTranslations();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/*
       * Topbar fija, 64px (h-16), fondo surface-base, borde inferior border-subtle.
       * Opaca — sin blur ni transparencia (regla 1 CLAUDE.md).
       */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface-base border-b border-subtle">
        <div className="flex items-center h-full px-4 md:px-6 gap-4">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            className="text-sm font-medium text-primary shrink-0"
          >
            {t('common.appName')}
          </Link>

          {/* ── Navegación (solo ≥ 640px) ─────────────────────── */}
          <div className="hidden sm:flex flex-1 items-center">
            <NavLinks role={user?.role ?? null} />
          </div>

          {/* ── Acciones derecha ──────────────────────────────── */}
          <div className="ml-auto flex items-center gap-0.5">

            {/* Toggle tema — visible en ≥ 640px (en mobile va dentro del drawer) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('topbar.toggleTheme')}
              className="hidden sm:flex size-9 items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
            >
              {theme === 'dark' ? (
                <Sun size={18} aria-hidden />
              ) : (
                <Moon size={18} aria-hidden />
              )}
            </button>

            {/* Campana — autenticado, visible en todos los breakpoints */}
            {user && <NotificationBell />}

            {/* Menú de perfil o botón login — solo ≥ 640px */}
            <div className="hidden sm:block">
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-1 inline-flex items-center px-3 py-1.5 rounded-sm bg-accent text-white text-sm font-medium hover:bg-accent-hover"
                >
                  {t('auth.login')}
                </Link>
              )}
            </div>

            {/* Hamburguesa — solo < 640px */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t('topbar.openMenu')}
              className="sm:hidden size-9 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil (portal implícito al final del body vía fixed) */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </>
  );
}
