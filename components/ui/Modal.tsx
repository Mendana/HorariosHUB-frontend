'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ─── Close context ─────────────────────────────────────────────────────────────
//
// Lets footer/children buttons trigger the animated close instead of calling the
// raw onClose prop (which would skip the exit animation).
//
//   import { useModalClose } from '@/components/ui/Modal';
//   const close = useModalClose();
//   <Button onClick={close}>Cancel</Button>

const CloseCtx = createContext<() => void>(() => {});
export const useModalClose = () => useContext(CloseCtx);

// ─── Types ─────────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg';

const SIZE_CLS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/** All interactive elements that should be included in the focus trap. */
const FOCUSABLE =
  'button:not([disabled]),[href],input:not([disabled]),' +
  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Must match --transition-smooth (250ms ease-in-out) in globals.css. */
const DURATION_MS = 250;

export interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  /**
   * When provided and set to false while the Modal is mounted, triggers the
   * exit animation. Useful for "always rendered" controlled patterns.
   * For the typical conditional-render pattern ({condition && <Modal>}) this
   * prop is not needed — animations work via the X button, overlay, and Escape.
   */
  isOpen?: boolean;
  /** Renders a structured header (title text + X button) + divider above body. */
  title?: string;
  /** Renders a right-aligned footer area + divider below body. */
  footer?: React.ReactNode;
  /**
   * 'sm' (max-w-sm) | 'md' (max-w-lg, default) | 'lg' (max-w-2xl)
   * Also accepts a legacy Tailwind max-w-* class string for backwards compat.
   */
  size?: Size | string;
  /** Accessible label for the close (X) button. */
  closeLabel?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function Modal({
  isOpen,
  onClose,
  title,
  footer,
  size = 'md',
  closeLabel = 'Cerrar',
  children,
}: ModalProps) {
  // `shown` drives the CSS transitions: false = invisible/scaled-down, true = visible.
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Prevents double-close when multiple exit paths fire close to each other.
  const closingRef = useRef(false);

  // ── Entrance animation ──────────────────────────────────────────────────────
  // Wait one frame before setting shown=true so the browser paints the initial
  // (invisible) state first — this is what makes the CSS transition actually run.
  useEffect(() => {
    if (isOpen === false) return; // don't animate in if starts closed
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []); // intentionally empty — only runs on mount

  // ── Animated close (X button / overlay / Escape) ────────────────────────────
  // Sets shown=false (CSS exit transition), then calls onClose after DURATION_MS.
  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setShown(false);
    setTimeout(() => {
      closingRef.current = false;
      onClose();
    }, DURATION_MS);
  }, [onClose]);

  // ── isOpen prop — external close trigger ────────────────────────────────────
  // When a parent controls the modal via an isOpen boolean (always-rendered
  // pattern), going false here triggers the exit animation without calling
  // onClose again (parent already managing state).
  useEffect(() => {
    if (isOpen === false && !closingRef.current) {
      closingRef.current = true;
      setShown(false);
    }
  }, [isOpen]);

  // ── Escape key ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // ── Focus trap ──────────────────────────────────────────────────────────────
  // Focuses the first focusable element and traps Tab / Shift+Tab within the panel.
  // Runs once shown=true so we wait for the animation to start before focusing.
  useEffect(() => {
    if (!shown) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Small delay so the animation has started and elements are interactive.
    const focusTimer = setTimeout(() => {
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      els[0]?.focus();
    }, 50);

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!els.length) return;
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onTab);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onTab);
    };
  }, [shown]);

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Size class ──────────────────────────────────────────────────────────────
  // 'sm'|'md'|'lg' → SIZE_CLS map  |  any other string → used as-is (legacy).
  const sizeClass = (size as string) in SIZE_CLS
    ? SIZE_CLS[size as Size]
    : (size as string);

  // ── CSS transition strings ──────────────────────────────────────────────────
  const overlayTransition = `opacity ${DURATION_MS}ms ease-in-out`;
  const panelTransition   = `opacity ${DURATION_MS}ms ease-in-out, transform ${DURATION_MS}ms ease-in-out`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return createPortal(
    <div
      // Mobile: items-end → panel anchored at bottom (bottom sheet).
      // Desktop (≥640px): items-center + p-4 → centered with breathing room.
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* ── Overlay ────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{ opacity: shown ? 1 : 0, transition: overlayTransition }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* ── Panel ──────────────────────────────────────────────────────────── */}
      {/*
       * Mobile: full width, top corners rounded only, no side padding.
       * Desktop: contained by sizeClass, all corners rounded, floating.
       *
       * transform origins:
       *   • hidden: translateY(16px) scale(0.97)   — slightly below + smaller
       *   • shown:  translateY(0)    scale(1)       — in place, full size
       *
       * On mobile the translateY(16px) gives a subtle "slide up from below" feel
       * matching the bottom-sheet anchor. On desktop it reads as a gentle
       * materialize-from-below. Combined with opacity it avoids abrupt appearance.
       */}
      <div
        ref={panelRef}
        className={[
          'relative z-10 w-full',
          sizeClass,
          'bg-surface-raised',
          // Mobile: only top corners rounded (panel touches bottom edge)
          // Desktop (sm+): all corners rounded (panel floats in center)
          'rounded-t-md sm:rounded-md',
          'shadow-md',
          'max-h-[90dvh] sm:max-h-[85vh]',
          // flex-col: header/footer are shrink-0, body is flex-1 + overflow-y-auto
          'flex flex-col overflow-hidden',
        ].join(' ')}
        style={{
          opacity:   shown ? 1 : 0,
          transform: shown ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: panelTransition,
        }}
      >
        <CloseCtx.Provider value={handleClose}>

          {/* ── Structured header (only when title prop provided) ─────────── */}
          {title && (
            <>
              <div className="flex items-center justify-between gap-4 px-6 py-4 shrink-0">
                <h2
                  id="modal-title"
                  className="text-base font-medium text-primary"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={closeLabel}
                  className="p-1 rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken transition-colors transition-base"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
              <div className="border-t border-subtle" aria-hidden />
            </>
          )}

          {/* ── Body ─────────────────────────────────────────────────────── */}
          {/*
           * When title is present: body gets p-6 (space-6 padding).
           * When title is absent (legacy mode): no padding — children manage it.
           */}
          <div className={['flex-1 overflow-y-auto', title ? 'p-6' : ''].join(' ')}>
            {children}
          </div>

          {/* ── Structured footer (only when footer prop provided) ────────── */}
          {footer && (
            <>
              <div className="border-t border-subtle" aria-hidden />
              <div className="flex justify-end gap-3 px-6 py-4 shrink-0">
                {footer}
              </div>
            </>
          )}

        </CloseCtx.Provider>
      </div>
    </div>,
    document.body,
  );
}
