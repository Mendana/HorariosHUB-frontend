'use client';

import { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

type Size = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id:         string;
  label?:     string;
  hint?:      string;
  error?:     string;
  size?:      Size;
  iconLeft?:  LucideIcon;
  iconRight?: LucideIcon;
}

// ─── Clase base compartida ───────────────────────────────────────────────────
//
// Exportada para inputs nativos fuera del componente Input (filtros, búsquedas
// inline, formularios con layout propio). Incluye todos los estados visuales;
// el consumidor solo añade height, padding y width según su contexto.

export const INPUT_FIELD_CLS = [
  'rounded-sm bg-surface-sunken border border-subtle text-primary',
  'placeholder:text-tertiary outline-none',
  'shadow-input transition-[border-color,box-shadow] transition-base',
  'hover:border-strong hover:shadow-input-hover',
  'focus:border-accent focus:shadow-input-focus',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

// ─── Size scale ──────────────────────────────────────────────────────────────

const sizeMap: Record<Size, {
  input:  string;
  icon:   number;
  plIcon: string;  // left padding when iconLeft present
  prIcon: string;  // right padding when iconRight present
}> = {
  sm: { input: 'h-7  px-2 text-sm',    icon: 14, plIcon: 'pl-7', prIcon: 'pr-7' },
  md: { input: 'h-9  px-3 text-sm',    icon: 15, plIcon: 'pl-8', prIcon: 'pr-8' },
  lg: { input: 'h-10 px-4 text-base',  icon: 16, plIcon: 'pl-9', prIcon: 'pr-9' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    id,
    label,
    hint,
    error,
    size       = 'md',
    iconLeft:  IconLeft,
    iconRight: IconRight,
    className  = '',
    ...rest
  }, ref) => {
    const { input: sizeCls, icon: iconSize, plIcon, prIcon } = sizeMap[size];

    const interactive = !rest.disabled && !rest.readOnly;

    const inputCls = [
      // Base layout
      'w-full rounded-sm outline-none',
      'bg-surface-sunken text-primary placeholder:text-tertiary',
      'border transition-[border-color,box-shadow] transition-base',

      // Rest: three-layer inset (top shadow + ambient + inner bottom highlight).
      // Error: keeps the depth layers, swaps inner highlight for error ring.
      error
        ? 'border-error shadow-input-error'
        : 'border-subtle shadow-input',

      // Hover: the inset flattens slightly ("rises to meet you") + border sharpens.
      // Skipped for error (red border must stay to preserve the error signal).
      interactive && !error && 'hover:border-strong hover:shadow-input-hover',

      // Focus: minimal inset (field feels "open") + accent ring + soft glow.
      // Uses :focus (not :focus-visible) — form fields should always show which
      // one is active, not just on keyboard navigation. This also overrides the
      // global *:focus-visible rule (@layer utilities > base).
      'focus:border-accent focus:shadow-input-focus',

      // Read-only: surface-base signals non-editable without opacity change.
      rest.readOnly && 'bg-surface-base',

      // Disabled
      rest.disabled && 'opacity-50 cursor-not-allowed',

      // Size
      sizeCls,

      // Icon padding — compensates for the icon so text never overlaps it.
      // Icons sit at left/right-2.5 (10px); padding = 10px + icon + gap.
      IconLeft  && plIcon,
      IconRight && prIcon,

      className,
    ].filter(Boolean).join(' ');

    const hintId  = hint  ? `${id}-hint`  : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">

        {label && (
          <label htmlFor={id} className="text-sm font-medium text-primary">
            {label}
          </label>
        )}

        <div className="relative">
          {IconLeft && (
            <span
              className="absolute top-1/2 left-2.5 -translate-y-1/2 pointer-events-none text-tertiary"
              aria-hidden="true"
            >
              <IconLeft size={iconSize} />
            </span>
          )}

          <input
            ref={ref}
            id={id}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId ?? hintId}
            className={inputCls}
            {...rest}
          />

          {IconRight && (
            <span
              className="absolute top-1/2 right-2.5 -translate-y-1/2 pointer-events-none text-tertiary"
              aria-hidden="true"
            >
              <IconRight size={iconSize} />
            </span>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-tertiary">
            {hint}
          </p>
        ) : null}

      </div>
    );
  }
);

Input.displayName = 'Input';
