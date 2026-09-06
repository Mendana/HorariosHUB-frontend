"use client";

import Image from "next/image";
import { Menu, Moon, Sun } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";

export function Topbar() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeAnimating, setThemeAnimating] = useState(false);

  function handleToggleTheme() {
    setThemeAnimating(true);
    toggleTheme();
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-13 topbar-gradient border-b border-subtle">
        <div className="flex items-center h-full px-4 md:px-6">
          {/* ── Zona izquierda: Logo ───────────────────────── */}
          <Link
            href="/"
            aria-label="Horarios Hub"
            className="shrink-0 transition-opacity transition-fast hover:opacity-80"
          >
            <Image
              src="/main-logo.svg"
              alt="Horarios Hub"
              height={28}
              width={140}
              className="h-7 w-auto"
              unoptimized
              priority
            />
          </Link>

          {/* Separador logo / nav — bg-strong para visibilidad en dark mode */}
          <div
            aria-hidden
            className="hidden sm:block mx-3 w-px h-4 bg-strong opacity-40 shrink-0"
          />

          {/* ── Zona central: Navegación (≥ 640px) ─────────── */}
          <div className="hidden sm:flex flex-1 items-center">
            <NavLinks role={user?.role ?? null} />
          </div>

          {/* Separador nav / acciones */}
          <div
            aria-hidden
            className="hidden sm:block mx-3 w-px h-4 bg-subtle shrink-0"
          />

          {/* ── Zona derecha: Acciones ──────────────────────── */}
          <div className="ml-auto sm:ml-0 flex items-center gap-0.5">
            {/* Toggle tema */}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={t("topbar.toggleTheme")}
              className="hidden sm:flex size-8 items-center justify-center rounded-sm text-tertiary hover:text-primary hover:bg-surface-raised transition-[background-color,color] transition-fast"
            >
              <span
                className={themeAnimating ? "theme-toggle-spin" : ""}
                onAnimationEnd={() => setThemeAnimating(false)}
                style={{ display: "flex" }}
              >
                {theme === "dark" ? (
                  <Sun size={16} aria-hidden />
                ) : (
                  <Moon size={16} aria-hidden />
                )}
              </span>
            </button>

            {/* Campana */}
            {user && <NotificationBell />}

            {/* Separador campana / perfil */}
            {user && (
              <div
                aria-hidden
                className="hidden sm:block mx-1.5 w-px h-4 bg-subtle shrink-0"
              />
            )}

            {/* Perfil o login */}
            <div className="hidden sm:block">
              {user ? (
                <UserMenu user={user} onLogout={logout} />
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-3 py-1.5 rounded-sm border border-subtle text-secondary text-xs font-medium hover:border-strong hover:bg-surface-raised hover:text-primary transition-[border-color,background-color,color] transition-base"
                >
                  {t("auth.login")}
                </Link>
              )}
            </div>

            {/* Hamburguesa */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("topbar.openMenu")}
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
