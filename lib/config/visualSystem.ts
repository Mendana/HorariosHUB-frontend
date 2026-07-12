/**
 * Visual System — Horarios Hub
 *
 * Direction: Linear meets tactile.
 * Dense, precise interfaces where every interactive element gives clear physical feedback.
 *
 * This file is documentation only — no runtime logic, no imports.
 * All actual values live in app/globals.css:
 *   - CSS custom properties in :root / .dark  → source of truth for values
 *   - @utility blocks                         → Tailwind classes (shadow-*, transition-*)
 *   - @layer base                             → global focus-visible and active rules
 */

// ─── SHADOWS ─────────────────────────────────────────────────────────────────
//
// Four semantic levels. Light mode: subtle (surface color carries depth).
// Dark mode: more pronounced (shadow creates depth that surface color can't).
//
// All values are context-sensitive CSS vars — light/dark resolved automatically.

/**
 * --shadow-sm
 * Cards at rest. 1–2px vertical lift. Near-zero opacity in light, stronger in dark.
 *
 * Usage:  className="shadow-sm"
 *         style={{ boxShadow: 'var(--shadow-sm)' }}
 */
export const SHADOW_SM = "var(--shadow-sm)" as const;

/**
 * --shadow-md
 * Raised floating elements: dropdowns, modals, popovers, command palettes.
 * Multi-layer (outer spread + base) for natural depth — 4–8px outer, 1–3px base.
 *
 * Usage:  className="shadow-md"
 */
export const SHADOW_MD = "var(--shadow-md)" as const;

/**
 * --shadow-inset
 * Sunken elements: inputs at rest, buttons in active/pressed state.
 * Physical "depression" sensation. Combine with outer shadow when needed:
 *   style={{ boxShadow: 'var(--shadow-inset)' }}
 *
 * Usage:  className="shadow-inset"
 *         combined at rest+focus: className="shadow-inset focus:shadow-focus"
 */
export const SHADOW_INSET = "var(--shadow-inset)" as const;

/**
 * --shadow-focus
 * Keyboard focus ring. 2px solid accent (inner) + soft accent glow (outer halo).
 * Replaces browser default outline. Applied globally to *:focus-visible.
 * Components that combine shadows on focus must merge explicitly:
 *   style={{ boxShadow: 'var(--shadow-inset), var(--shadow-focus)' }}
 *
 * Usage:  className="shadow-focus"     (manual, e.g. always-focused states)
 *         global rule in @layer base   (automatic on :focus-visible)
 */
export const SHADOW_FOCUS = "var(--shadow-focus)" as const;

/**
 * --shadow-focus-error
 * Same structure as shadow-focus but in error color. For invalid input fields.
 * Applied alongside border-error in the error state of form inputs.
 *
 * Usage:  style={{ boxShadow: 'var(--shadow-focus-error)' }}
 */
export const SHADOW_FOCUS_ERROR = "var(--shadow-focus-error)" as const;

// ─── TRANSITIONS ─────────────────────────────────────────────────────────────
//
// Four named speeds. Always ease-out for exits (fast feel), ease-in-out for
// entrances (smooth feel). Duration is the only thing that changes per level.
//
// All are also available as Tailwind utilities: transition-fast, transition-base,
// transition-smooth, transition-slow. They set duration + easing together.

/**
 * --transition-fast  →  100ms ease-out
 * Micro-feedback: checkbox/radio toggle, active/pressed scale, icon swaps.
 * Fast enough to feel instant, visible enough to feel responsive.
 *
 * Tailwind:  className="transition-[transform] transition-fast"
 */
export const TRANSITION_FAST = "var(--transition-fast)" as const;

/**
 * --transition-base  →  150ms ease-out
 * Default for all hover states: background, border, color, filter changes.
 * The "normal speed" of the UI — used most often.
 *
 * Tailwind:  className="transition-colors transition-base"
 *            className="transition-[border-color,background-color] transition-base"
 */
export const TRANSITION_BASE = "var(--transition-base)" as const;

/**
 * --transition-smooth  →  250ms ease-in-out
 * Opening/closing: modals, dropdowns, collapsibles, slide-in drawers.
 * Feels considered without being slow. Uses ease-in-out so entry/exit are balanced.
 *
 * Tailwind:  className="transition-[opacity,transform] transition-smooth"
 */
export const TRANSITION_SMOOTH = "var(--transition-smooth)" as const;

/**
 * --transition-slow  →  350ms ease-in-out
 * Reserved for page transitions if ever added (CLAUDE.md rule 2: none currently).
 * Exists to complete the scale — do NOT use for interactive UI elements.
 */
export const TRANSITION_SLOW = "var(--transition-slow)" as const;

// ─── HOVER SYSTEM ────────────────────────────────────────────────────────────

/**
 * Interactive surfaces: table rows, list items, nav items, menu entries.
 *
 *   Default surface:  bg-surface-base → bg-surface-raised on hover
 *   Already raised:   subtle brightness bump (~3%) instead of level change
 *
 * Rules:
 *   ✓ background transition only — no transform on hover for surfaces
 *   ✓ always transition-base (150ms ease-out)
 *   ✗ no scale, translate, or shadow changes on surface hover
 *
 * Tailwind pattern:
 *   className="transition-colors transition-base hover:bg-surface-raised"
 *   className="transition-[filter] transition-base hover:brightness-[1.03]"   ← if already raised
 */
export const HOVER_SURFACE = {
  base: "transition-colors transition-base hover:bg-surface-raised",
  raised: "transition-[filter] transition-base hover:brightness-[1.03]",
} as const;

/**
 * Buttons and action elements.
 *
 *   Primary (accent bg):
 *     Hover → brightness(1.08) — lighter, energized
 *     Active → scale(0.97) + shadow-inset — physically pressed in
 *
 *   Secondary (border only):
 *     Hover → border-strong + slight surface fill
 *
 *   Destructive (error color):
 *     Same brightness pattern as primary but on error color base
 *
 * Tailwind pattern (primary):
 *   className="transition-[filter,box-shadow,transform] transition-base
 *              hover:brightness-[1.08]
 *              active:scale-[0.97] active:[box-shadow:var(--shadow-inset)]"
 *
 * Tailwind pattern (secondary):
 *   className="transition-[border-color,background-color] transition-base
 *              hover:border-strong hover:bg-surface-raised"
 */
export const HOVER_BUTTON = {
  primary:
    "transition-[filter,box-shadow,transform] transition-base hover:brightness-[1.08]",
  secondary:
    "transition-[border-color,background-color] transition-base hover:border-strong hover:bg-surface-raised",
  destructive:
    "transition-[filter,box-shadow,transform] transition-base hover:brightness-[1.08]",
} as const;

/**
 * Small clickable elements: icon buttons, chips, tag badges, inline link-actions.
 *
 *   Hover → accent-subtle background, gentle highlight without button weight
 *   Use transition-fast (100ms) — small targets feel snappy
 *
 * Tailwind pattern:
 *   className="rounded-sm transition-colors transition-fast hover:bg-accent-subtle"
 */
export const HOVER_SMALL = {
  base: "rounded-sm transition-colors transition-fast hover:bg-accent-subtle",
} as const;

// ─── ACTIVE / PRESSED STATE ──────────────────────────────────────────────────

/**
 * All clickable elements communicate press via scale reduction.
 * Applied globally to button and [role="button"] in @layer base.
 * Manual classes needed for other elements.
 *
 *   Large (buttons ≥ 36px):   scale(0.97) + shadow-inset
 *   Small (icon btn, chips):  scale(0.95) — more visible because element is small
 *
 * Duration: transition-fast (100ms) — snappy, physical sensation.
 *
 * Tailwind pattern (large):
 *   className="active:scale-[0.97] active:[box-shadow:var(--shadow-inset)]
 *              transition-[transform,box-shadow] transition-fast"
 *
 * Tailwind pattern (small):
 *   className="active:scale-[0.95] transition-[transform] transition-fast"
 */
export const ACTIVE_PRESS = {
  large:
    "active:scale-[0.97] active:[box-shadow:var(--shadow-inset)] transition-[transform,box-shadow] transition-fast",
  small: "active:scale-[0.95] transition-[transform] transition-fast",
} as const;

// ─── FOCUS VISIBLE ───────────────────────────────────────────────────────────

/**
 * Keyboard focus only (focus-visible, never plain :focus).
 * Applied globally in @layer base — no manual classes needed for default behavior.
 *
 *   Style: 2px solid accent ring + 2px offset + soft outer glow (shadow-focus)
 *   Never show the browser's native outline.
 *
 * Components that need custom focus (schedule grid cells, dropdown items)
 * override with their own :focus-visible rule.
 *
 * For inputs, combine inset + focus ring explicitly:
 *   style={{ boxShadow: 'var(--shadow-inset), var(--shadow-focus)' }}
 *   (global rule sets only shadow-focus, overwriting the inset — merge manually)
 */
export const FOCUS_VISIBLE = {
  ring: "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
} as const;

// ─── FORM STATES ─────────────────────────────────────────────────────────────

/**
 * Input field states (text, email, password, select, textarea).
 * All state transitions use transition-base (150ms ease-out).
 *
 *   Reposo:  border-subtle + shadow-inset (sunken, tactile)
 *   Hover:   border-strong (border brightens as cursor approaches)
 *   Focus:   border-accent + shadow-focus (full engagement)
 *   Error:   border-error + shadow-focus-error (clear problem signal)
 *
 * Important: :focus-visible in @layer base sets box-shadow: var(--shadow-focus),
 * which REPLACES shadow-inset. For proper combined effect on focus:
 *   style={{ boxShadow: hasFocus ? 'var(--shadow-inset), var(--shadow-focus)' : 'var(--shadow-inset)' }}
 *
 * Full Tailwind base class:
 *   "bg-surface-sunken border border-subtle [box-shadow:var(--shadow-inset)]
 *    h-10 px-4 rounded-sm outline-none
 *    transition-[border-color,box-shadow] transition-base
 *    hover:border-strong
 *    focus:border-accent focus:[box-shadow:var(--shadow-inset),var(--shadow-focus)]"
 */
export const INPUT_STATES = {
  base: "bg-surface-sunken border border-subtle [box-shadow:var(--shadow-inset)] h-10 px-4 rounded-sm outline-none",
  transition: "transition-[border-color,box-shadow] transition-base",
  hover: "hover:border-strong",
  focus:
    "focus:border-accent focus:[box-shadow:var(--shadow-inset),var(--shadow-focus)]",
  error: "border-error [box-shadow:var(--shadow-focus-error)]",
} as const;

/**
 * Custom checkbox / radio — not native browser controls.
 * Check animation: scale(0.8→1.0) + opacity(0→1), transition-fast.
 * Implemented per-component (custom SVG checkmark) — not globally applied.
 *
 *   Reposo:   border-strong, bg-surface-sunken
 *   Hover:    border-accent (invitation to interact)
 *   Checked:  bg-accent, white mark, no visible border
 *
 * Tailwind pattern (container):
 *   "size-4 rounded-sm border border-strong bg-surface-sunken
 *    transition-[border-color,background-color] transition-fast
 *    hover:border-accent
 *    data-[checked]:bg-accent data-[checked]:border-accent"
 */
export const CHECKBOX_STATES = {
  base: "size-4 rounded-sm border border-strong bg-surface-sunken",
  transition: "transition-[border-color,background-color] transition-fast",
  hover: "hover:border-accent",
  checked: "data-[checked]:bg-accent data-[checked]:border-accent",
} as const;
