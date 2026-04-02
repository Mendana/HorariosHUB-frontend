'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal, useModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import type { UserEvent, NewEventData, EventType } from '@/lib/types/events';

// ─── Time options: 00:00 – 23:30 in 30-min steps ─────────────────────────────

const TIME_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 48 },
  (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const val = `${String(h).padStart(2, '0')}:${m}`;
    return { value: val, label: val };
  },
);

const DESC_MAX = 200;

// ─── Inner form (access to useModalClose) ────────────────────────────────────

interface FormBodyProps {
  initial?: UserEvent;
  isSaving: boolean;
  onSubmit: (data: NewEventData) => void;
}

function FormBody({ initial, isSaving, onSubmit }: FormBodyProps) {
  const t      = useTranslations('events');
  const tc     = useTranslations('classes');
  const close  = useModalClose();

  const [title, setTitle]       = useState(initial?.title ?? '');
  const [type, setType]         = useState<EventType>(initial?.type ?? 'reminder');
  const [date, setDate]         = useState(initial?.date ?? '');
  const [time, setTime]         = useState(initial?.time ?? '09:00');
  const [desc, setDesc]         = useState(initial?.description ?? '');
  const [errors, setErrors]     = useState<Partial<Record<'title' | 'date', string>>>({});

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = tc('errorRequired');
    if (!date)         errs.date  = tc('errorRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title:       title.trim(),
      type,
      date,
      time,
      description: desc.trim() || undefined,
    });
  }

  const TYPE_OPTIONS: { value: EventType; label: string }[] = [
    { value: 'delivery', label: t('typeDelivery') },
    { value: 'deadline', label: t('typeDeadline') },
    { value: 'reminder', label: t('typeReminder') },
    { value: 'other',    label: t('typeOther')    },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="event-form-title" className="text-sm font-medium text-primary">
          {t('fieldTitle')}
        </label>
        <input
          id="event-form-title"
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
          placeholder={t('titlePlaceholder')}
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'event-form-title-error' : undefined}
          className={[INPUT_FIELD_CLS, 'h-9 px-3 text-sm', errors.title ? 'border-error [box-shadow:var(--shadow-focus-error)]' : ''].join(' ')}
        />
        {errors.title && <p id="event-form-title-error" role="alert" className="text-xs text-error">{errors.title}</p>}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-primary" id="event-form-type-label">
          {t('fieldType')}
        </label>
        <Select
          value={type}
          onChange={(v) => setType(v as EventType)}
          options={TYPE_OPTIONS}
          ariaLabel={t('fieldType')}
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-primary">
          {t('fieldDate')}
        </label>
        <DatePicker
          value={date}
          onChange={(v) => { setDate(v); if (errors.date) setErrors((p) => ({ ...p, date: undefined })); }}
          placeholder={t('datePlaceholder')}
          error={errors.date}
        />
      </div>

      {/* Time */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-primary">
          {t('fieldTime')}
        </label>
        <Select
          value={time}
          onChange={setTime}
          options={TIME_OPTIONS}
          ariaLabel={t('fieldTime')}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="event-form-desc" className="text-sm font-medium text-primary">
          {t('fieldDescription')}
        </label>
        <textarea
          id="event-form-desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value.slice(0, DESC_MAX))}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          className={[
            INPUT_FIELD_CLS,
            'h-auto py-2 px-3 text-sm resize-none',
          ].join(' ')}
        />
        <p className="text-xs text-tertiary text-right tabular-nums">
          {desc.length}/{DESC_MAX}
        </p>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={close}>
          {tc('cancel')}
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={isSaving}>
          {tc('save')}
        </Button>
      </div>
    </form>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface EventFormProps {
  /** Pass existing event to edit; omit for create */
  initial?: UserEvent;
  onSubmit: (data: NewEventData) => Promise<void>;
  onClose:  () => void;
}

export function EventForm({ initial, onSubmit, onClose }: EventFormProps) {
  const t = useTranslations('events');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(data: NewEventData) {
    setIsSaving(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      size="sm"
      title={initial ? t('editEvent') : t('newEvent')}
      closeLabel={t('cancel')}
      onClose={onClose}
    >
      <FormBody
        initial={initial}
        isSaving={isSaving}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
