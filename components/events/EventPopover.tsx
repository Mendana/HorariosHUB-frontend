'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import type { UserEvent } from '@/lib/types/events';
import { EVENT_TYPE_COLOR } from './EventLine';

const POPOVER_WIDTH    = 224;
const POPOVER_EST_HEIGHT = 168;
const GAP              = 8;

interface EventPopoverProps {
  event: UserEvent;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onClose:  () => void;
  onEdit:   (event: UserEvent) => void;
  onDelete: (id: string) => void;
}

export function EventPopover({ event, anchorRef, onClose, onEdit, onDelete }: EventPopoverProps) {
  const t = useTranslations('events');

  const [pos, setPos]         = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Position relative to dot
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();

    let top = rect.bottom + GAP;
    if (top + POPOVER_EST_HEIGHT > window.innerHeight - GAP) {
      top = rect.top - POPOVER_EST_HEIGHT - GAP;
      if (top < GAP) top = GAP;
    }

    let left = rect.left - POPOVER_WIDTH / 2;
    if (left + POPOVER_WIDTH > window.innerWidth - GAP) left = window.innerWidth - POPOVER_WIDTH - GAP;
    left = Math.max(GAP, left);

    setPos({ top, left });
    requestAnimationFrame(() => setVisible(true));
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;

  const color    = EVENT_TYPE_COLOR[event.type];
  const cssColor = event.color ?? color.css;
  const textCls  = event.color ? '' : color.tailwindText;

  const TYPE_LABEL_KEYS: Record<string, string> = {
    delivery: 'typeDelivery',
    deadline: 'typeDeadline',
    reminder: 'typeReminder',
    other:    'typeOther',
  };

  const content = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={event.title}
      style={{
        position:   'fixed',
        top:        pos?.top ?? 0,
        left:       pos?.left ?? 0,
        width:      POPOVER_WIDTH,
        zIndex:     50,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={[
        'bg-surface-raised border border-subtle rounded-md shadow-md p-4',
        'origin-top-left transition-[opacity,transform] transition-smooth',
        visible && pos ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Type badge */}
          <span
            className={['text-[10px] font-medium px-1.5 py-0.5 rounded-sm shrink-0', textCls].join(' ')}
            style={{
              ...(event.color ? { color: cssColor } : {}),
              backgroundColor: `color-mix(in oklch, ${cssColor} 12%, transparent)`,
            }}
          >
            {t(TYPE_LABEL_KEYS[event.type] ?? 'typeOther')}
          </span>
          <h3 className="text-sm font-medium text-primary leading-snug truncate">
            {event.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          aria-label={t('cancel')}
          className="shrink-0 mt-0.5 size-5 flex items-center justify-center rounded-sm text-tertiary transition-colors transition-fast hover:text-secondary hover:bg-surface-sunken"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 mb-2">
        <Clock size={12} className="text-tertiary shrink-0" aria-hidden />
        <span className="text-xs text-secondary tabular-nums">{event.time}</span>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-secondary leading-relaxed mb-3 line-clamp-3">
          {event.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-subtle">
        <Button
          size="sm"
          variant="secondary"
          iconLeft={Pencil}
          onClick={() => onEdit(event)}
        >
          {t('edit')}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          iconLeft={Trash2}
          onClick={() => onDelete(event.id)}
        >
          {t('delete')}
        </Button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
