'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Modal, useModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { fetchAllSubjects, fetchGroupsForSubject } from '@/lib/api/subjects';
import type { EventItem, EventInput, EventRecurrenceInterval } from '@/lib/types/events';

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

const RECURRENCE_INTERVALS: EventRecurrenceInterval[] = ['daily', 'weekly', 'biweekly', 'monthly'];

const DESC_MAX = 200;

// ─── ISO <-> wall-clock helpers (UTC convention, matches the rest of the app) ─

function isoToDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  return { date, time };
}

function dateTimeToIso(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min)).toISOString();
}

// ─── Form state ────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  subject: string;
  groups: string[];
  date: string;
  startTime: string;
  endTime: string;
  classroom: string;
  description: string;
  recurrenceEnabled: boolean;
  recurrenceInterval: EventRecurrenceInterval;
  recurrenceEndDate: string;
}

function initState(initial?: EventItem): FormState {
  if (!initial) {
    return {
      title: '', subject: '', groups: [], date: '', startTime: '09:00', endTime: '10:00',
      classroom: '', description: '', recurrenceEnabled: false, recurrenceInterval: 'weekly',
      recurrenceEndDate: '',
    };
  }
  const start = isoToDateTime(initial.startTime);
  const end = isoToDateTime(initial.endTime);
  return {
    title: initial.title,
    subject: initial.subject,
    groups: initial.groups,
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    classroom: initial.classroom ?? '',
    description: initial.description ?? '',
    recurrenceEnabled: !!initial.recurrence,
    recurrenceInterval: initial.recurrence?.interval ?? 'weekly',
    recurrenceEndDate: initial.recurrence?.endDate ?? '',
  };
}

interface FormErrors {
  title?: string;
  subject?: string;
  date?: string;
  endTime?: string;
  recurrenceEndDate?: string;
}

// ─── Inner form (access to useModalClose) ────────────────────────────────────

interface FormBodyProps {
  initial?: EventItem;
  isSaving: boolean;
  onSubmit: (data: EventInput) => void;
}

function FormBody({ initial, isSaving, onSubmit }: FormBodyProps) {
  const t     = useTranslations('events');
  const tc    = useTranslations('classes');
  const close = useModalClose();

  const [form, setForm]     = useState<FormState>(() => initState(initial));
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: fetchAllSubjects,
    staleTime: 10 * 60 * 1000,
  });

  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['subject-groups', form.subject],
    queryFn: () => fetchGroupsForSubject(form.subject),
    enabled: !!form.subject,
    staleTime: 5 * 60 * 1000,
  });

  const subjectOptions = useMemo(
    () => (subjectsData?.subjects ?? []).map((code) => ({ value: code, label: code })),
    [subjectsData],
  );
  const groupOptions = groupsData?.groups ?? [];

  function handleSubjectChange(code: string) {
    setForm((prev) => ({ ...prev, subject: code, groups: [] }));
    if (errors.subject) setErrors((p) => ({ ...p, subject: undefined }));
  }

  function toggleGroup(name: string) {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.includes(name)
        ? prev.groups.filter((g) => g !== name)
        : [...prev.groups, name],
    }));
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.title.trim())       errs.title   = tc('errorRequired');
    if (!form.subject)            errs.subject = tc('errorRequired');
    if (!form.date)               errs.date    = tc('errorRequired');
    if (!form.startTime || !form.endTime || form.endTime <= form.startTime) {
      errs.endTime = t('errorEndBeforeStart');
    }
    if (form.recurrenceEnabled) {
      if (!form.recurrenceEndDate) {
        errs.recurrenceEndDate = tc('errorRequired');
      } else if (form.recurrenceEndDate < form.date) {
        errs.recurrenceEndDate = t('errorRecurrenceEndBeforeStart');
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      subject: form.subject,
      groups: form.groups,
      startTime: dateTimeToIso(form.date, form.startTime),
      endTime: dateTimeToIso(form.date, form.endTime),
      classroom: form.classroom.trim() || undefined,
      recurrence: form.recurrenceEnabled
        ? { interval: form.recurrenceInterval, endDate: form.recurrenceEndDate }
        : undefined,
    });
  }

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
          value={form.title}
          onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
          placeholder={t('titlePlaceholder')}
          maxLength={200}
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'event-form-title-error' : undefined}
          className={[INPUT_FIELD_CLS, 'h-9 px-3 text-sm', errors.title ? 'border-error [box-shadow:var(--shadow-focus-error)]' : ''].join(' ')}
        />
        {errors.title && <p id="event-form-title-error" role="alert" className="text-xs text-error">{errors.title}</p>}
      </div>

      {/* Subject */}
      <Select
        label={t('fieldSubject')}
        value={form.subject}
        onChange={handleSubjectChange}
        placeholder={loadingSubjects ? tc('loading') : tc('selectSubject')}
        options={subjectOptions}
        searchable
        error={errors.subject}
        disabled={loadingSubjects}
      />

      {/* Groups — optional multi-select via checkboxes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">{t('fieldGroups')}</label>
        {!form.subject ? (
          <p className="text-xs text-tertiary">{tc('selectSubjectFirst')}</p>
        ) : loadingGroups ? (
          <p className="text-xs text-tertiary">{tc('loading')}</p>
        ) : groupOptions.length === 0 ? (
          <p className="text-xs text-tertiary">{tc('noGroups')}</p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-sm border border-subtle bg-surface-sunken p-3">
            {groupOptions.map((g) => (
              <Checkbox
                key={g.id}
                checked={form.groups.includes(g.name)}
                onChange={() => toggleGroup(g.name)}
                label={g.name}
                size="sm"
              />
            ))}
          </div>
        )}
        <p className="text-xs text-tertiary">{t('groupsHint')}</p>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-primary">{t('fieldDate')}</label>
        <DatePicker
          value={form.date}
          onChange={(v) => { setForm((p) => ({ ...p, date: v })); if (errors.date) setErrors((p) => ({ ...p, date: undefined })); }}
          placeholder={t('datePlaceholder')}
          error={errors.date}
        />
      </div>

      {/* Start / end time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-primary">{t('fieldStartTime')}</label>
          <Select
            value={form.startTime}
            onChange={(v) => { setForm((p) => ({ ...p, startTime: v })); if (errors.endTime) setErrors((p) => ({ ...p, endTime: undefined })); }}
            options={TIME_OPTIONS}
            ariaLabel={t('fieldStartTime')}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-primary">{t('fieldEndTime')}</label>
          <Select
            value={form.endTime}
            onChange={(v) => { setForm((p) => ({ ...p, endTime: v })); if (errors.endTime) setErrors((p) => ({ ...p, endTime: undefined })); }}
            options={TIME_OPTIONS}
            ariaLabel={t('fieldEndTime')}
            error={errors.endTime}
          />
        </div>
      </div>

      {/* Classroom */}
      <div className="flex flex-col gap-1">
        <label htmlFor="event-form-classroom" className="text-sm font-medium text-primary">
          {tc('classroomOptional')}
        </label>
        <input
          id="event-form-classroom"
          type="text"
          value={form.classroom}
          onChange={(e) => setForm((p) => ({ ...p, classroom: e.target.value }))}
          placeholder={tc('placeholderClassroom')}
          className={[INPUT_FIELD_CLS, 'h-9 px-3 text-sm'].join(' ')}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="event-form-desc" className="text-sm font-medium text-primary">
          {t('fieldDescription')}
        </label>
        <textarea
          id="event-form-desc"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value.slice(0, DESC_MAX) }))}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          className={[INPUT_FIELD_CLS, 'h-auto py-2 px-3 text-sm resize-none'].join(' ')}
        />
        <p className="text-xs text-tertiary text-right tabular-nums">
          {form.description.length}/{DESC_MAX}
        </p>
      </div>

      {/* Recurrence */}
      <div className="flex flex-col gap-2 rounded-sm border border-subtle p-3">
        <Checkbox
          checked={form.recurrenceEnabled}
          onChange={(checked) => setForm((p) => ({ ...p, recurrenceEnabled: checked }))}
          label={t('enableRecurrence')}
        />
        {form.recurrenceEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary">{t('fieldRecurrenceInterval')}</label>
              <Select
                value={form.recurrenceInterval}
                onChange={(v) => setForm((p) => ({ ...p, recurrenceInterval: v as EventRecurrenceInterval }))}
                options={RECURRENCE_INTERVALS.map((i) => ({ value: i, label: t(`interval_${i}`) }))}
                ariaLabel={t('fieldRecurrenceInterval')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary">{t('fieldRecurrenceEndDate')}</label>
              <DatePicker
                value={form.recurrenceEndDate}
                onChange={(v) => { setForm((p) => ({ ...p, recurrenceEndDate: v })); if (errors.recurrenceEndDate) setErrors((p) => ({ ...p, recurrenceEndDate: undefined })); }}
                placeholder={t('datePlaceholder')}
                minDate={form.date || undefined}
                error={errors.recurrenceEndDate}
              />
            </div>
          </div>
        )}
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
  initial?: EventItem;
  onSubmit: (data: EventInput) => Promise<void>;
  onClose:  () => void;
}

export function EventForm({ initial, onSubmit, onClose }: EventFormProps) {
  const t = useTranslations('events');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(data: EventInput) {
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
