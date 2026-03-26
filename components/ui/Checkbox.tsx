'use client';

import { useRef, useEffect, useId } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  /** Visible label text — wraps in a clickable span inside the label element. */
  label?: string;
  /** Accessible name when no visible label is provided. */
  ariaLabel?: string;
  size?: 'sm' | 'md';
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SIZES = { sm: 16, md: 18 } as const;

// SVG paths inside a 12×12 viewBox.
// Checkmark:     M2,6 → M5,9 → M10,3   actual length ≈ 12.05 → use 14 for safe full-hide
// Indeterminate: M3,6 → M9,6            actual length = 6 → use 8 for safe full-hide
const CHECK_PATH = 'M 2 6 L 5 9 L 10 3';
const CHECK_LEN  = 14;
const INDET_PATH = 'M 3 6 L 9 6';
const INDET_LEN  = 8;

// ─── Component ─────────────────────────────────────────────────────────────────

export function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  label,
  ariaLabel,
  size = 'md',
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const px = SIZES[size];

  // indeterminate cannot be set as a React prop — needs direct DOM access
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // isChecked = true only when checked AND NOT in indeterminate state
  const isChecked = checked && !indeterminate;

  // ── Visual box classes ──────────────────────────────────────────────────────
  //   • Unchecked:      surface-sunken bg, strong border
  //                     hover (via group/cb): accent border + raised bg
  //   • Checked:        accent bg + accent border
  //   • Indeterminate:  accent-subtle bg + accent border
  //   • Active press:   scale 0.8 → 1  (group-active on parent label fires this)
  const boxStateClass = isChecked
    ? 'bg-accent border-accent'
    : indeterminate
    ? 'bg-accent-subtle border-accent'
    : 'bg-surface-sunken border-strong group-hover/cb:border-accent group-hover/cb:bg-surface-raised';

  return (
    <label
      className={[
        'inline-flex items-center gap-2 select-none',
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer group/cb',
      ].join(' ')}
    >
      {/* ── Native input — invisible, provides a11y + keyboard + form ─────── */}
      <span className="relative shrink-0" style={{ width: px, height: px }}>
        <input
          ref={inputRef}
          id={uid}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-label={!label ? ariaLabel : undefined}
          className="absolute inset-0 w-full h-full opacity-0 z-10 m-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* ── Visual box ─────────────────────────────────────────────────── */}
        <span
          aria-hidden="true"
          className={[
            'absolute inset-0 flex items-center justify-center',
            'rounded-sm border overflow-hidden',
            'transition-[border-color,background-color,transform] transition-fast',
            boxStateClass,
            !disabled ? 'group-active/cb:scale-[0.8]' : '',
          ].join(' ')}
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full"
          >
            {/*
             * Checkmark — draws left→right via stroke-dashoffset animation.
             * Visible only when isChecked. White stroke on accent background.
             */}
            <path
              d={CHECK_PATH}
              stroke="white"
              strokeWidth="2"
              strokeDasharray={CHECK_LEN}
              strokeDashoffset={isChecked ? 0 : CHECK_LEN}
              style={{ transition: 'stroke-dashoffset 100ms ease-out' }}
            />

            {/*
             * Indeterminate dash — same animation technique.
             * Visible only when indeterminate. Accent stroke on accent-subtle bg.
             */}
            <path
              d={INDET_PATH}
              strokeWidth="2.4"
              strokeDasharray={INDET_LEN}
              strokeDashoffset={indeterminate ? 0 : INDET_LEN}
              style={{ stroke: 'var(--accent)', transition: 'stroke-dashoffset 100ms ease-out' }}
            />
          </svg>
        </span>
      </span>

      {/* ── Optional visible label ──────────────────────────────────────────── */}
      {label && (
        <span className={`text-sm leading-tight ${checked || indeterminate ? 'text-primary' : 'text-secondary'}`}>
          {label}
        </span>
      )}
    </label>
  );
}
