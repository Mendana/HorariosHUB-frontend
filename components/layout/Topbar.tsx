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
  const [themeAnimating, setThemeAnimating] = useState(false);

  function handleToggleTheme() {
    setThemeAnimating(true);
    toggleTheme();
  }

  return (
    <>
      {/*
       * Topbar fija, 52px. Tres zonas: [Logo | Nav central | Acciones].
       * Fondo opaco con micro-gradiente — sin blur ni glassmorphism (regla 1).
       */}
      <header className="fixed top-0 inset-x-0 z-40 h-[52px] topbar-gradient border-b border-subtle">
        <div className="flex items-center h-full px-4 md:px-6">

          {/* ── Zona izquierda: Logo ──────────────────────────── */}
          <Link
            href="/"
            aria-label="PCEO Hub"
            className="shrink-0 transition-opacity transition-fast hover:opacity-80"
          >
            <span className="text-[15px] font-semibold text-primary">PCEO</span>
            <span className="text-[15px] font-normal text-accent">Hub</span>
          </Link>

          {/* Separador logo / nav */}
          <div aria-hidden className="hidden sm:block mx-3 w-px h-4 bg-subtle shrink-0" />

          {/* ── Zona central: Navegación (≥ 640px) ───────────── */}
          <div className="hidden sm:flex flex-1 items-center">
            <NavLinks role={user?.role ?? null} />
          </div>

          {/* Separador nav / acciones */}
          <div aria-hidden className="hidden sm:block mx-3 w-px h-4 bg-subtle shrink-0" />

          {/* ── Zona derecha: Acciones ───────────────────────── */}
          <div className="ml-auto sm:ml-0 flex items-center gap-0.5">

            {/* Toggle tema — visible en ≥ 640px (en mobile va en el drawer) */}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={t('topbar.toggleTheme')}
              className="hidden sm:flex size-8 items-center justify-center rounded-sm text-tertiary hover:text-primary hover:bg-surface-raised transition-[background-color,color] transition-fast"
            >
              <span
                className={themeAnimating ? 'theme-toggle-spin' : ''}
                onAnimationEnd={() => setThemeAnimating(false)}
                style={{ display: 'flex' }}
              >
                {theme === 'dark'
                  ? <Sun  size={16} aria-hidden />
                  : <Moon size={16} aria-hidden />
                }
              </span>
            </button>

            {/* Campana — autenticado, todos los breakpoints */}
            {user && <NotificationBell />}

            {/* Separador campana / perfil */}
            {user && (
              <div aria-hidden className="hidden sm:block mx-1.5 w-px h-4 bg-subtle shrink-0" />
            )}

            {/* Perfil o login — solo ≥ 640px */}
            <div className="hidden sm:block">
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3 py-1.5 rounded-sm border border-subtle text-secondary text-xs font-medium hover:border-strong hover:bg-surface-raised hover:text-primary transition-[border-color,background-color,color] transition-base"
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
              className="sm:hidden size-8 flex items-center justify-center rounded-sm text-tertiary hover:text-primary hover:bg-surface-raised transition-[background-color,color] transition-fast"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>

        </div>
      </header>

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
