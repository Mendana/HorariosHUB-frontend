'use client';

import type { LucideIcon } from 'lucide-react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  iconLeft?:  LucideIcon;
  iconRight?: LucideIcon;
  fullWidth?: boolean;
}

// ─── Size scale ──────────────────────────────────────────────────────────────

const sizeMap: Record<Size, { cls: string; icon: number; spinner: number }> = {
  sm: { cls: 'h-7  px-3 text-sm',   icon: 14, spinner: 12 },
  md: { cls: 'h-9  px-4 text-sm',   icon: 15, spinner: 13 },
  lg: { cls: 'h-10 px-5 text-base', icon: 16, spinner: 14 },
};

// ─── Variant styles ──────────────────────────────────────────────────────────
//
// Hover/active guarded with enabled: so disabled buttons have zero interaction feedback.
// shadow-inset on active: adds depth to the "pressed in" sensation alongside scale+translate.
// Focus ring: global *:focus-visible rule in globals.css (shadow-focus). No manual class needed.
//
// Secondary hover background: color-mix blends raised→sunken 30% — subtle but token-consistent.
//   Light: 97% → ~96.1%  |  Dark: 19% → ~16.3%  — no abrupt jump in either theme.

const variantMap: Record<Variant, string> = {
  primary: [
    'bg-accent text-white',
    'enabled:hover:brightness-[1.08] enabled:hover:shadow-md',
    'enabled:active:shadow-inset',
  ].join(' '),

  secondary: [
    'bg-surface-raised border border-strong text-primary',
    'enabled:hover:[background-color:color-mix(in_oklch,var(--surface-raised)_70%,var(--surface-sunken))]',
    'enabled:hover:border-accent enabled:hover:shadow-md',
    'enabled:active:shadow-inset',
  ].join(' '),

  destructive: [
    'bg-error text-white',
    'enabled:hover:brightness-[1.08] enabled:hover:shadow-md',
    'enabled:active:shadow-inset',
  ].join(' '),

  ghost: [
    'text-secondary',
    'enabled:hover:bg-surface-raised enabled:hover:text-primary',
    // No shadow-md/inset — ghost is lightweight, no background surface to cast from.
  ].join(' '),
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Button({
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  iconLeft:  IconLeft,
  iconRight: IconRight,
  fullWidth  = false,
  children,
  disabled,
  className  = '',
  ...props
}: ButtonProps) {
  const { cls: sizeCls, icon: iconSize, spinner: spinnerSize } = sizeMap[size];

  const base = [
    'relative inline-flex items-center justify-center gap-2 rounded-sm font-medium select-none cursor-pointer',

    // btn-transition: spring curve for scale+translate (bounce-back on release),
    //   smooth 200ms ease-in-out for colors/shadows.
    // btn-transition-press (active override): 80ms ease-in snap for press-in feel.
    //   When released, btn-transition retakes control → spring produces the bounce.
    'btn-transition',
    'enabled:active:btn-transition-press',

    // Hover: lift the button off the surface (translate up + grow slightly).
    // Uses CSS individual `scale` and `translate` properties (not transform shorthand)
    // so they cascade cleanly with the global button:active rule in globals.css.
    'enabled:hover:-translate-y-px enabled:hover:scale-[1.015]',

    // Active: press it down below rest position.
    // scale-[0.93] overrides both the global scale:0.97 rule (same property, higher layer)
    // and the hover scale:1.015. translate-y-[1px] overrides hover translate-y-[-1px].
    // Net visual: 2px below hover = clear "sinking" sensation.
    'enabled:active:scale-[0.93] enabled:active:translate-y-[1px]',

    // Disabled: zero interaction feedback.
    // scale-100/translate-y-0 override the global button:active rule for disabled state.
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'disabled:active:scale-100 disabled:active:translate-y-0 disabled:active:shadow-none',

    fullWidth ? 'w-full' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${sizeCls} ${variantMap[variant]} ${className}`.trim()}
    >
      {/* Content layer — invisible when loading but still occupies space, preserving button width */}
      <span className={`inline-flex items-center gap-2${loading ? ' invisible' : ''}`}>
        {IconLeft  && <IconLeft  size={iconSize} aria-hidden />}
        {children}
        {IconRight && <IconRight size={iconSize} aria-hidden />}
      </span>

      {/* Spinner — absolutely centered over the invisible content */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <Spinner size={spinnerSize} />
        </span>
      )}
    </button>
  );
}
