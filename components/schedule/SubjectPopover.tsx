'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Clock, Calendar, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';

// Full-type badge styling used inside the popover (wider badges than the block corner)
const TYPE_BADGE_CLS: Partial<Record<string, string>> = {
  'Práctica': 'bg-warning-subtle text-warning',
  'Examen':   'bg-error-subtle text-error',
  'Otros':    'bg-surface-sunken text-tertiary border border-subtle',
};

const POPOVER_WIDTH = 256;
const POPOVER_HEIGHT_EST = 248; // estimated height for position clamping
const GAP = 8; // min distance from viewport edges

interface SubjectPopoverProps {
  subject: SubjectWithLayout;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  /** undefined = user cannot edit (hide button) */
  onEdit?: () => void;
  /** undefined = user cannot delete (hide button) */
  onDelete?: () => void;
}

export function SubjectPopover({
  subject,
  anchorRef,
  onClose,
  onEdit,
  onDelete,
}: SubjectPopoverProps) {
  const [pos, setPos]         = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const tc     = useTranslations('classes');
  const tp     = useTranslations('proposals');
  const locale = useLocale();
  const { user } = useAuth();

  const canManage = user?.role === 'professor' || user?.role === 'admin';
  // Authenticated non-manager users can propose changes
  const canPropose = user !== null && !canManage;

  // ── Portal mount guard ──────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // ── Position calculation ────────────────────────────────────────────────────
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();

    // Vertical: prefer below the block, fall back to above
    let top = rect.bottom + GAP;
    if (top + POPOVER_HEIGHT_EST > window.innerHeight - GAP) {
      top = rect.top - POPOVER_HEIGHT_EST - GAP;
      if (top < GAP) top = GAP; // last resort: top of viewport
    }

    // Horizontal: align with block left, clamp to viewport
    let left = rect.left;
    if (left + POPOVER_WIDTH > window.innerWidth - GAP) {
      left = window.innerWidth - POPOVER_WIDTH - GAP;
    }
    left = Math.max(GAP, left);

    setPos({ top, left });
    // Slight delay so the element exists before we trigger the transition
    requestAnimationFrame(() => setVisible(true));
  }, [anchorRef]);

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // ── Close on Escape ─────────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ── Type label & badge ──────────────────────────────────────────────────────
  const TYPE_LABELS: Record<string, string> = {
    'Teoría':   tc('typeTeoria'),
    'Práctica': tc('typePractica'),
    'Examen':   tc('typeExamen'),
    'Otros':    tc('typeOtros'),
  };
  const typeLabel    = TYPE_LABELS[subject.type] ?? subject.type;
  const typeBadgeCls = TYPE_BADGE_CLS[subject.type] ?? 'bg-accent-subtle text-accent';

  // ── Date formatting ─────────────────────────────────────────────────────────
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(
    subject.date.year,
    subject.date.month - 1,
    subject.date.day,
  )));

  if (!mounted) return null;

  const content = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={subject.name}
      style={{
        position: 'fixed',
        top:      pos?.top ?? 0,
        left:     pos?.left ?? 0,
        width:    POPOVER_WIDTH,
        zIndex:   50,
        // Hidden until position is calculated to avoid flash at (0,0)
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={[
        'bg-surface-raised border border-subtle rounded-md shadow-md p-4',
        'origin-top-left transition-[opacity,transform] transition-smooth',
        visible && pos ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
      ].join(' ')}
    >
      {/* ── Header: name + close button ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-primary leading-snug break-words min-w-0">
          {subject.name}
        </h3>
        <button
          onClick={onClose}
          aria-label={tc('cancel')}
          className="shrink-0 mt-0.5 size-5 flex items-center justify-center rounded-sm text-tertiary transition-colors transition-fast hover:text-secondary hover:bg-surface-sunken"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      {/* ── Type ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-secondary shrink-0">{tc('colType')}:</span>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${typeBadgeCls}`}>
          {typeLabel}
        </span>
      </div>

      {/* ── Classroom ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin size={12} className="text-tertiary shrink-0" aria-hidden />
        <span className="text-xs text-secondary truncate">
          {subject.classroom || tc('noClassroom')}
        </span>
      </div>

      {/* ── Time ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-2">
        <Clock size={12} className="text-tertiary shrink-0" aria-hidden />
        <span className="text-xs text-secondary tabular-nums">
          {subject.startTime} – {subject.endTime}
        </span>
      </div>

      {/* ── Date ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar size={12} className="text-tertiary shrink-0" aria-hidden />
        <span className="text-xs text-secondary">
          {formattedDate}
        </span>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      {(canManage || canPropose) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-subtle">
          {canManage && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              iconLeft={Pencil}
              onClick={onEdit}
            >
              {tc('edit')}
            </Button>
          )}
          {canManage && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              iconLeft={Trash2}
              onClick={onDelete}
            >
              {tc('delete')}
            </Button>
          )}
          {canPropose && (
            // TODO: add "schedule.proposeChange" translation key and wire up ProposalForm
            <Button
              size="sm"
              variant="secondary"
              iconLeft={MessageSquare}
              onClick={onClose}
            >
              {tp('actionCreate')}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
