'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Shows a search input at the top of the dropdown. */
  searchable?: boolean;
  /** Message shown when search yields no results. */
  emptySearchText?: string;
  label?: string;
  id?: string;
  ariaLabel?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DURATION_MS = 250; // transition-smooth

// Mirrors Input.tsx size scale
const SIZE_MAP = {
  sm: { h: 'h-7',  text: 'text-sm',   px: 'px-2', chevron: 14 },
  md: { h: 'h-9',  text: 'text-sm',   px: 'px-3', chevron: 15 },
  lg: { h: 'h-10', text: 'text-base', px: 'px-4', chevron: 16 },
} as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export function Select({
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  size = 'md',
  searchable = false,
  emptySearchText,
  label,
  id,
  ariaLabel,
}: SelectProps) {
  const generatedId          = useId();
  const uid                  = id ?? generatedId;

  const [isOpen, setIsOpen]           = useState(false);
  const [shown,  setShown]            = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [highlightedIdx, setHighlighted] = useState(-1);
  const [search, setSearch]           = useState('');
  const [dropStyle, setDropStyle]     = useState<React.CSSProperties>({});

  const triggerRef  = useRef<HTMLButtonElement>(null);
  const dropRef     = useRef<HTMLDivElement>(null);
  const listRef     = useRef<HTMLUListElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);
  const closingRef  = useRef(false);

  const { h, text, px, chevron } = SIZE_MAP[size];

  const selectedOption  = options.find(o => o.value === value);
  const filteredOptions = searchable && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // ── Animation: one rAF after isOpen becomes true ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // ── Open ──────────────────────────────────────────────────────────────────
  function openDropdown() {
    if (disabled || isOpen) return;

    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    setSearch('');
    setShown(false);

    if (!mobile && triggerRef.current) {
      const rect        = triggerRef.current.getBoundingClientRect();
      const spaceBelow  = window.innerHeight - rect.bottom;
      const style: React.CSSProperties = { minWidth: rect.width };

      if (spaceBelow >= 200 || spaceBelow >= rect.top) {
        style.top  = rect.bottom + 4;
        style.left = rect.left;
      } else {
        style.bottom = window.innerHeight - rect.top + 4;
        style.left   = rect.left;
      }
      setDropStyle(style);
    }

    const selIdx = options.findIndex(o => o.value === value);
    setHighlighted(selIdx >= 0 ? selIdx : 0);
    setIsOpen(true);
  }

  // ── Close (animated) ──────────────────────────────────────────────────────
  const closeDropdown = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setShown(false);
    setTimeout(() => {
      setIsOpen(false);
      closingRef.current = false;
    }, DURATION_MS);
  }, []);

  // ── Select an option ──────────────────────────────────────────────────────
  function selectOption(val: string) {
    onChange(val);
    closeDropdown();
    triggerRef.current?.focus();
  }

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      ) return;
      closeDropdown();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeDropdown]);

  // ── Focus search input once panel is visible ──────────────────────────────
  useEffect(() => {
    if (!shown || !searchable) return;
    searchRef.current?.focus();
  }, [shown, searchable]);

  // ── Reset highlight when search changes ───────────────────────────────────
  useEffect(() => {
    setHighlighted(0);
  }, [search]);

  // ── Scroll highlighted option into view ───────────────────────────────────
  useEffect(() => {
    if (!listRef.current || highlightedIdx < 0) return;
    const items = listRef.current.querySelectorAll<HTMLElement>('[data-opt]');
    items[highlightedIdx]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIdx, shown]);

  // ── Stable ref for keyboard handler ───────────────────────────────────────
  // Updated every render so the handler always reads fresh values without
  // needing to be in its dependency array.
  const liveRef = useRef({ filteredOptions, highlightedIdx, selectOption });
  liveRef.current = { filteredOptions, highlightedIdx, selectOption };

  // ── Global keyboard when open ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      const { filteredOptions: opts, highlightedIdx: hi } = liveRef.current;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted(prev => {
          let next = prev + 1;
          while (next < opts.length && opts[next]?.disabled) next++;
          return next < opts.length ? next : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted(prev => {
          let next = prev - 1;
          while (next >= 0 && opts[next]?.disabled) next--;
          return next >= 0 ? next : prev;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = opts[hi];
        if (opt && !opt.disabled) liveRef.current.selectOption(opt.value);
      } else if (e.key === 'Escape') {
        closeDropdown();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeDropdown]);

  // ── Trigger classes ───────────────────────────────────────────────────────
  const triggerCls = [
    'w-full flex items-center gap-2 rounded-sm outline-none text-left',
    'bg-surface-sunken border',
    'transition-[border-color,box-shadow] transition-base',
    h, text, px,
    // Border + shadow state
    error
      ? 'border-error shadow-input-error'
      : isOpen
        ? 'border-accent shadow-input-focus'
        : 'border-subtle shadow-input',
    // Hover (skip when error or open — those states already have strong border)
    !disabled && !error && !isOpen
      ? 'hover:border-strong hover:shadow-input-hover'
      : '',
    // Keyboard focus ring when closed (open state uses accent border above)
    !disabled && !isOpen && !error
      ? 'focus-visible:border-accent focus-visible:shadow-input-focus'
      : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    // Text color: placeholder vs selected
    selectedOption ? 'text-primary' : 'text-tertiary',
  ].filter(Boolean).join(' ');

  // ── Option item classes ───────────────────────────────────────────────────
  function optCls(opt: SelectOption, i: number) {
    const isSel  = opt.value === value;
    const isHigh = i === highlightedIdx;
    return [
      'flex items-center justify-between gap-2 px-3 py-2 text-sm select-none',
      'transition-colors transition-fast',
      opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      !opt.disabled && (isSel || isHigh)
        ? 'bg-accent-subtle'
        : !opt.disabled
          ? 'hover:bg-accent-subtle'
          : '',
      isSel
        ? 'text-accent'
        : isHigh && !opt.disabled
          ? 'text-primary'
          : 'text-secondary hover:text-primary',
    ].filter(Boolean).join(' ');
  }

  // ── Shared dropdown content (options list + optional search) ──────────────
  const dropContent = (
    <>
      {searchable && (
        <div className="px-2 pt-2 pb-1.5 border-b border-subtle">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
              aria-hidden
            />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={label ?? ariaLabel}
              aria-controls={`${uid}-lb`}
              className={`${INPUT_FIELD_CLS} h-8 w-full pl-7 pr-2 text-sm`}
            />
          </div>
        </div>
      )}
      <ul
        ref={listRef}
        role="listbox"
        id={`${uid}-lb`}
        className="overflow-y-auto max-h-60 py-1"
      >
        {filteredOptions.length === 0 && emptySearchText ? (
          <li className="px-3 py-2 text-sm text-tertiary">{emptySearchText}</li>
        ) : (
          filteredOptions.map((opt, i) => (
            <li
              key={opt.value}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={opt.value === value}
              aria-disabled={opt.disabled ?? false}
              data-opt=""
              onMouseDown={e => e.preventDefault()} // keep focus on trigger
              onClick={() => !opt.disabled && selectOption(opt.value)}
              className={optCls(opt, i)}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && (
                <Check size={14} className="shrink-0 text-accent" aria-hidden />
              )}
            </li>
          ))
        )}
      </ul>
    </>
  );

  // ── Desktop dropdown panel ────────────────────────────────────────────────
  const desktopPanel = (
    <div
      ref={dropRef}
      className="fixed z-50 rounded-md border border-subtle bg-surface-raised shadow-md overflow-hidden"
      style={{
        ...dropStyle,
        opacity:    shown ? 1 : 0,
        transform:  shown ? 'translateY(0)' : 'translateY(-4px)',
        transition: `opacity ${DURATION_MS}ms ease-in-out, transform ${DURATION_MS}ms ease-in-out`,
      }}
    >
      {dropContent}
    </div>
  );

  // ── Mobile bottom sheet ───────────────────────────────────────────────────
  const mobileSheet = (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-50 bg-black/50"
        style={{
          opacity:    shown ? 1 : 0,
          transition: `opacity ${DURATION_MS}ms ease-in-out`,
        }}
        onClick={closeDropdown}
      />
      <div
        ref={dropRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-md bg-surface-raised border-t border-subtle shadow-md flex flex-col max-h-[70vh]"
        style={{
          opacity:    shown ? 1 : 0,
          transform:  shown ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: `opacity ${DURATION_MS}ms ease-in-out, transform ${DURATION_MS}ms ease-in-out`,
        }}
      >
        {dropContent}
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={uid} className="text-sm font-medium text-primary">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={uid}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${uid}-lb` : undefined}
        aria-activedescendant={
          isOpen && highlightedIdx >= 0 ? `${uid}-opt-${highlightedIdx}` : undefined
        }
        aria-label={!label ? ariaLabel : undefined}
        aria-invalid={error ? 'true' : undefined}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={e => {
          if (!disabled && !isOpen &&
            (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')
          ) {
            e.preventDefault();
            openDropdown();
          }
          // Prevent page scroll while navigating open dropdown
          if (isOpen && (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
          }
        }}
        className={triggerCls}
      >
        <span className="flex-1 min-w-0 truncate">
          {selectedOption ? selectedOption.label : (placeholder ?? '')}
        </span>
        <ChevronDown
          size={chevron}
          aria-hidden
          className={`shrink-0 text-tertiary transition-[transform] transition-base ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {error && (
        <p role="alert" className="text-xs text-error">{error}</p>
      )}

      {isOpen && createPortal(
        isMobile ? mobileSheet : desktopPanel,
        document.body,
      )}
    </div>
  );
}
