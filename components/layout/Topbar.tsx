'use client';

import { Menu, Moon, Search, Sun } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NavLinks } from './NavLinks';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch, triggerSearchNavigate, type SearchResult } from '@/lib/hooks/useSearch';

export function Topbar() {
  const t = useTranslations();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [themeAnimating, setThemeAnimating] = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchVisible,  setSearchVisible]  = useState(false);

  // Search state lives here so SearchResults can be rendered outside overflow-hidden
  const { query, setQuery, results, clearSearch } = useSearch();
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  // Ref for click-outside on the whole search area (input + dropdown)
  const searchAreaRef = useRef<HTMLDivElement>(null);

  function openSearch() {
    setHighlightedIdx(-1);
    setSearchOpen(true);
    requestAnimationFrame(() => setSearchVisible(true));
  }

  function closeSearch() {
    clearSearch();
    setHighlightedIdx(-1);
    setSearchVisible(false);
    setTimeout(() => setSearchOpen(false), 250);
  }

  function handleToggleTheme() {
    setThemeAnimating(true);
    toggleTheme();
  }

  function handleSelect(result: SearchResult) {
    triggerSearchNavigate(result);
    closeSearch();
  }

  function handleSearchNavigate(delta: -1 | 1) {
    if (results.length === 0) return;
    setHighlightedIdx((prev) => {
      const next = prev + delta;
      if (next < 0) return results.length - 1;
      if (next >= results.length) return 0;
      return next;
    });
  }

  function handleSearchEnter() {
    if (highlightedIdx >= 0 && highlightedIdx < results.length) {
      handleSelect(results[highlightedIdx]);
    }
  }

  // Click outside the search area → close
  useEffect(() => {
    if (!searchOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showResults = searchOpen && query.trim().length >= 2;

  return (
    <>
      {/*
       * position: fixed crea un containing block → los hijos absolute se
       * posicionan relativos al header, no al viewport. Esto permite que el
       * dropdown de resultados salga por debajo sin estar dentro del
       * overflow-hidden del wrapper de animación.
       */}
      <header className="fixed top-0 inset-x-0 z-40 h-13 topbar-gradient border-b border-subtle">
        <div className="flex items-center h-full px-4 md:px-6">

          {/* ── Zona izquierda: Logo ───────────────────────── */}
          <Link
            href="/"
            aria-label="PCEO Hub"
            className="shrink-0 transition-opacity transition-fast hover:opacity-80"
          >
            <span className="text-[15px] font-semibold text-primary tracking-tight">PCEO</span>
            <span className="text-[15px] font-normal text-accent tracking-tight">Hub</span>
          </Link>

          {/* Separador logo / nav — bg-strong para visibilidad en dark mode */}
          <div aria-hidden className="hidden sm:block mx-3 w-px h-4 bg-strong opacity-40 shrink-0" />

          {/* ── Zona central: Navegación (≥ 640px) ─────────── */}
          <div className="hidden sm:flex flex-1 items-center">
            <NavLinks role={user?.role ?? null} />
          </div>

          {/* Separador nav / acciones */}
          <div aria-hidden className="hidden sm:block mx-3 w-px h-4 bg-subtle shrink-0" />

          {/* ── Zona derecha: Acciones ──────────────────────── */}
          <div className="ml-auto sm:ml-0 flex items-center gap-0.5">

            {/*
             * Search (desktop): wrapper con ref que cubre tanto el input
             * (overflow-hidden para la animación de ancho) como el dropdown
             * (renderizado fuera de overflow-hidden, directo en el header).
             * El ref permite cerrar al hacer click fuera.
             */}
            <div ref={searchAreaRef} className="hidden sm:block relative">
              {/* Input — overflow-hidden solo aquí, no afecta al dropdown */}
              <div
                className="overflow-hidden transition-[width] duration-250 ease-in-out"
                style={{ width: searchOpen ? (searchVisible ? 220 : 0) : 0 }}
              >
                {/* Montamos SearchBar solo cuando está abierto para evitar
                    auto-focus al cargar la página y el doble-input visual */}
                {searchOpen && (
                  <div className="w-55 py-1">
                    <SearchBar
                      query={query}
                      onQueryChange={(q) => { setQuery(q); setHighlightedIdx(-1); }}
                      onClose={closeSearch}
                      onClear={clearSearch}
                      onNavigate={handleSearchNavigate}
                      onEnter={handleSearchEnter}
                    />
                  </div>
                )}
              </div>

              {/* Dropdown — hermano del input, NO dentro de overflow-hidden.
                  Es absolute dentro del header (fixed = containing block). */}
              {showResults && (
                <div className="absolute right-0 top-13 z-50">
                  <SearchResults query={query} results={results} onSelect={handleSelect} highlightedIdx={highlightedIdx} />
                </div>
              )}
            </div>

            {/* Search icon — oculto mientras el input está abierto */}
            {!searchOpen && (
              <button
                type="button"
                onClick={openSearch}
                title={t('search.hint')}
                aria-label={t('search.hint')}
                className="hidden sm:flex size-8 items-center justify-center rounded-sm text-tertiary hover:text-primary hover:bg-surface-raised transition-[background-color,color] transition-fast"
              >
                <Search size={16} aria-hidden />
              </button>
            )}

            {/* Toggle tema */}
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
                {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
              </span>
            </button>

            {/* Campana */}
            {user && <NotificationBell />}

            {/* Separador campana / perfil */}
            {user && (
              <div aria-hidden className="hidden sm:block mx-1.5 w-px h-4 bg-subtle shrink-0" />
            )}

            {/* Perfil o login */}
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

            {/* Hamburguesa */}
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

        {/* ─ Search (mobile) — overlay sobre la topbar ── */}
        {searchOpen && (
          <div
            className="sm:hidden absolute inset-0 flex items-center px-3 topbar-gradient z-10"
            style={{ opacity: searchVisible ? 1 : 0, transition: 'opacity 250ms ease-in-out' }}
          >
            <SearchBar
              query={query}
              onQueryChange={(q) => { setQuery(q); setHighlightedIdx(-1); }}
              onClose={closeSearch}
              onClear={clearSearch}
              onNavigate={handleSearchNavigate}
              onEnter={handleSearchEnter}
            />
          </div>
        )}

        {/* Dropdown mobile — fuera del inset-0 para no quedar recortado */}
        {showResults && (
          <div className="sm:hidden absolute left-0 right-0 top-13 z-50 px-3">
            <SearchResults query={query} results={results} onSelect={handleSelect} highlightedIdx={highlightedIdx} />
          </div>
        )}
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
