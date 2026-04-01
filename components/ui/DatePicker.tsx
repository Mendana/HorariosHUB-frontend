'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';

// ─── Constants ──────────────────────────────────────────────────────────────────

const DURATION_MS      = 250;
const CALENDAR_WIDTH   = 280;
const PANEL_EST_HEIGHT = 320;

// Mon–Sun column header abbreviations by locale root.
// 'X' for Wednesday is a Spanish-specific convention (not standard Intl output).
const DAY_HEADERS: Record<string, readonly string[]> = {
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};

// ─── Pure helpers ───────────────────────────────────────────────────────────────

function parseISO(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

function toISO(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** 42-cell Mon–Sun grid for the given year/month. */
function buildCalendarDays(year: number, month: number) {
  const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; currentMonth: boolean }[] = [];

  for (let i = firstDow; i > 0; i--)
    cells.push({ date: new Date(year, month, 1 - i), currentMonth: false });

  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), currentMonth: true });

  let next = 1;
  while (cells.length < 42)
    cells.push({ date: new Date(year, month + 1, next++), currentMonth: false });

  return cells;
}

function formatTriggerDate(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }).format(date);
  } catch {
    return toISO(date);
  }
}

function formatMonthYear(year: number, month: number, locale: string): string {
  try {
    const s = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
      .format(new Date(year, month, 1));
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    return `${month + 1}/${year}`;
  }
}

function getShortMonths(locale: string): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    try {
      const s = new Intl.DateTimeFormat(locale, { month: 'short' })
        .format(new Date(2000, i, 1));
      const clean = s.replace(/\.$/, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    } catch {
      return String(i + 1);
    }
  });
}

// ─── Props ──────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?:       string;                   // ISO 'YYYY-MM-DD'
  onChange:     (value: string) => void;
  placeholder?: string;
  error?:       string;
  disabled?:    boolean;
  minDate?:     string;                   // ISO
  maxDate?:     string;                   // ISO
  label?:       string;
  id?:          string;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  error,
  disabled = false,
  minDate,
  maxDate,
  label,
  id,
}: DatePickerProps) {
  const generatedId = useId();
  const uid         = id ?? generatedId;
  const locale      = useLocale();

  const todayRef = useRef<Date>((() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })());
  const today = todayRef.current;

  const selectedDate = value ? parseISO(value) : null;
  const refDate      = selectedDate ?? today;

  const [isOpen,    setIsOpen]    = useState(false);
  const [shown,     setShown]     = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const [view,      setView]      = useState<'days' | 'months'>('days');
  const [viewYear,  setViewYear]  = useState(refDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(refDate.getMonth());
  const [focused,   setFocused]   = useState<Date | null>(null);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // Stable ref so keyboard handler always reads fresh values
  const live = useRef({ focused, selectedDate, minDate, maxDate, onChange });
  live.current = { focused, selectedDate, minDate, maxDate, onChange };

  // ── isDateDisabled ────────────────────────────────────────────────────────────

  const isDateDisabled = useCallback((date: Date): boolean => {
    if (live.current.minDate) {
      const min = parseISO(live.current.minDate);
      if (min && date < min) return true;
    }
    if (live.current.maxDate) {
      const max = parseISO(live.current.maxDate);
      if (max && date > max) return true;
    }
    return false;
  }, []);

  // ── Animation ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // ── Open / Close ──────────────────────────────────────────────────────────────

  function openDropdown() {
    if (disabled || isOpen) return;

    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    setShown(false);
    setView('days');

    const ref = selectedDate ?? today;
    setViewYear(ref.getFullYear());
    setViewMonth(ref.getMonth());
    setFocused(selectedDate ? new Date(selectedDate) : null);

    if (!mobile && triggerRef.current) {
      const rect       = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const style: React.CSSProperties = { width: CALENDAR_WIDTH };

      if (spaceBelow >= PANEL_EST_HEIGHT || spaceBelow >= rect.top) {
        style.top  = rect.bottom + 4;
        style.left = rect.left;
      } else {
        style.bottom = window.innerHeight - rect.top + 4;
        style.left   = rect.left;
      }
      setDropStyle(style);
    }

    setIsOpen(true);
  }

  const closeDropdown = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setShown(false);
    setTimeout(() => {
      setIsOpen(false);
      setView('days');
      closingRef.current = false;
    }, DURATION_MS);
  }, []);

  // ── Select ────────────────────────────────────────────────────────────────────

  function selectDate(date: Date) {
    if (isDateDisabled(date)) return;
    onChange(toISO(date));
    closeDropdown();
    triggerRef.current?.focus();
  }

  // ── Click outside ─────────────────────────────────────────────────────────────

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

  // ── Keyboard ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeDropdown();
        triggerRef.current?.focus();
        return;
      }

      // Arrow navigation only in day view
      if (view !== 'days') return;

      if (e.key === 'PageUp') {
        e.preventDefault();
        setViewMonth(m => {
          if (m === 0) { setViewYear(y => y - 1); return 11; }
          return m - 1;
        });
        return;
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        setViewMonth(m => {
          if (m === 11) { setViewYear(y => y + 1); return 0; }
          return m + 1;
        });
        return;
      }

      let delta = 0;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); delta = -1; }
      if (e.key === 'ArrowRight') { e.preventDefault(); delta =  1; }
      if (e.key === 'ArrowUp')    { e.preventDefault(); delta = -7; }
      if (e.key === 'ArrowDown')  { e.preventDefault(); delta =  7; }

      if (delta !== 0) {
        const base = live.current.focused ?? live.current.selectedDate ?? today;
        const next = new Date(base);
        next.setDate(next.getDate() + delta);
        setFocused(next);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const target = live.current.focused ?? live.current.selectedDate ?? today;
        if (!isDateDisabled(target)) {
          live.current.onChange(toISO(target));
          closeDropdown();
          triggerRef.current?.focus();
        }
      }
    }

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, view, closeDropdown, isDateDisabled, today]);

  // ── Navigation helpers ────────────────────────────────────────────────────────

  function prevClick() {
    if (view === 'months') {
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => {
        if (m === 0) { setViewYear(y => y - 1); return 11; }
        return m - 1;
      });
    }
  }

  function nextClick() {
    if (view === 'months') {
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => {
        if (m === 11) { setViewYear(y => y + 1); return 0; }
        return m + 1;
      });
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const calendarDays = buildCalendarDays(viewYear, viewMonth);
  const dayHeaders   = DAY_HEADERS[locale.split('-')[0]] ?? DAY_HEADERS['en'];
  const shortMonths  = getShortMonths(locale);
  const daySize      = isMobile ? 'w-10 h-10' : 'w-8 h-8';

  // ── Cell classes ──────────────────────────────────────────────────────────────

  function dayCellCls(cell: { date: Date; currentMonth: boolean }): string {
    const { date, currentMonth } = cell;
    const isTd  = sameDay(date, today);
    const isSel = !!selectedDate && sameDay(date, selectedDate);
    const isFoc = !!focused      && sameDay(date, focused);
    const isDis = isDateDisabled(date);

    return [
      'flex items-center justify-center rounded-sm text-sm tabular-nums select-none',
      daySize,
      'transition-colors transition-fast',
      isDis ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      isSel
        ? 'bg-accent text-white'
        : isTd
          ? 'border border-accent text-accent'
          : '',
      isFoc && !isSel && !isDis ? 'bg-surface-raised' : '',
      !isDis && !isSel           ? 'hover:bg-surface-raised' : '',
      !isSel && !isDis && !isTd
        ? currentMonth ? 'text-primary' : 'text-tertiary'
        : '',
    ].filter(Boolean).join(' ');
  }

  function monthCellCls(monthIdx: number): string {
    const now       = new Date();
    const isCurrent = monthIdx === now.getMonth() && viewYear === now.getFullYear();
    const isSel     = !!selectedDate
      && selectedDate.getMonth()    === monthIdx
      && selectedDate.getFullYear() === viewYear;

    return [
      'flex items-center justify-center rounded-sm text-sm py-2 cursor-pointer select-none',
      'transition-colors transition-fast',
      isSel
        ? 'bg-accent text-white'
        : isCurrent
          ? 'text-accent hover:bg-surface-raised'
          : 'text-secondary hover:bg-surface-raised hover:text-primary',
    ].join(' ');
  }

  // ── Trigger classes ───────────────────────────────────────────────────────────

  const triggerCls = [
    'w-full flex items-center gap-2 rounded-sm text-left outline-none',
    'bg-surface-sunken border h-10 px-3 text-sm',
    'transition-[border-color,box-shadow] transition-base',
    error
      ? 'border-error shadow-input-error'
      : isOpen
        ? 'border-accent shadow-input-focus'
        : 'border-subtle shadow-input',
    !disabled && !error && !isOpen
      ? 'hover:border-strong hover:shadow-input-hover'
      : '',
    !disabled && !isOpen && !error
      ? 'focus-visible:border-accent focus-visible:shadow-input-focus'
      : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].filter(Boolean).join(' ');

  // ── Calendar content (shared between desktop panel and mobile sheet) ──────────

  const calendarContent = (
    <div className={isMobile ? 'p-4' : 'p-3'}>

      {/* Header: prev ‹ · month/year label · next › */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevClick}
          className="flex items-center justify-center w-7 h-7 rounded-sm text-tertiary transition-colors transition-fast hover:bg-accent-subtle active:scale-[0.95]"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>

        {view === 'days' ? (
          <button
            type="button"
            onClick={() => setView('months')}
            className="text-sm font-medium text-primary hover:text-accent transition-colors transition-fast px-1"
          >
            {formatMonthYear(viewYear, viewMonth, locale)}
          </button>
        ) : (
          <span className="text-sm font-medium text-primary">{viewYear}</span>
        )}

        <button
          type="button"
          onClick={nextClick}
          className="flex items-center justify-center w-7 h-7 rounded-sm text-tertiary transition-colors transition-fast hover:bg-accent-subtle active:scale-[0.95]"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      {view === 'days' ? (
        <>
          {/* Day-of-week column headers */}
          <div className="grid grid-cols-7 mb-1">
            {dayHeaders.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-xs font-medium text-tertiary h-7"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid — 6 rows × 7 cols */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  role="button"
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => !isDateDisabled(cell.date) && selectDate(cell.date)}
                  onMouseEnter={() => !isDateDisabled(cell.date) && setFocused(cell.date)}
                  className={dayCellCls(cell)}
                >
                  {cell.date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Month picker — 3×4 grid */
        <div className="grid grid-cols-3 gap-1 mt-1">
          {shortMonths.map((name, i) => (
            <div
              key={i}
              role="button"
              tabIndex={-1}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setViewMonth(i); setView('days'); }}
              className={monthCellCls(i)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Desktop panel ─────────────────────────────────────────────────────────────

  const desktopPanel = (
    <div
      ref={dropRef}
      role="dialog"
      aria-modal="true"
      className="fixed z-50 rounded-md border border-subtle bg-surface-raised shadow-md overflow-hidden"
      style={{
        ...dropStyle,
        opacity:    shown ? 1 : 0,
        transform:  shown ? 'translateY(0)' : 'translateY(-4px)',
        transition: `opacity ${DURATION_MS}ms ease-in-out, transform ${DURATION_MS}ms ease-in-out`,
      }}
    >
      {calendarContent}
    </div>
  );

  // ── Mobile bottom sheet ───────────────────────────────────────────────────────

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
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-md bg-surface-raised border-t border-subtle shadow-md"
        style={{
          opacity:    shown ? 1 : 0,
          transform:  shown ? 'translateY(0)' : 'translateY(16px)',
          transition: `opacity ${DURATION_MS}ms ease-in-out, transform ${DURATION_MS}ms ease-in-out`,
        }}
      >
        {calendarContent}
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

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
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={error ? 'true' : undefined}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        className={triggerCls}
      >
        <span className={`flex-1 min-w-0 truncate ${selectedDate ? 'text-primary' : 'text-tertiary'}`}>
          {selectedDate ? formatTriggerDate(selectedDate, locale) : placeholder}
        </span>
        <Calendar size={16} aria-hidden className="shrink-0 text-tertiary" />
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
