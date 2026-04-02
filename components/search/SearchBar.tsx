'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  onClear: () => void;
  /** Called when ArrowUp/ArrowDown/Enter are pressed in the input */
  onNavigate?: (delta: -1 | 1) => void;
  onEnter?: () => void;
}

export function SearchBar({ query, onQueryChange, onClose, onClear, onNavigate, onEnter }: SearchBarProps) {
  const t = useTranslations('search');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape closes
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClear(); onClose(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, onClear]);

  return (
    <div className="flex items-center gap-1.5 h-8 px-2 w-full rounded-sm bg-surface-sunken border border-subtle focus-within:border-strong transition-[border-color] transition-base">
      <Search size={14} className="text-tertiary shrink-0" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
        aria-autocomplete="list"
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); onNavigate?.(1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); onNavigate?.(-1); }
          else if (e.key === 'Enter')  { e.preventDefault(); onEnter?.(); }
        }}
        className="flex-1 bg-transparent text-[13px] text-primary placeholder:text-tertiary outline-none min-w-0"
      />
      {query && (
        <button
          type="button"
          onClick={() => { onClear(); inputRef.current?.focus(); }}
          aria-label={t('clear')}
          className="size-4 flex items-center justify-center text-tertiary hover:text-primary transition-[color] transition-fast"
        >
          <X size={12} aria-hidden />
        </button>
      )}
    </div>
  );
}
