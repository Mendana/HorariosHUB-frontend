'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { Class, ClassInput } from '@/lib/types/classes';
import { fetchAllSubjects, fetchGroupsForSubject } from '@/lib/api/subjects';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';

// Time slots 08:00–21:00 in 30-min increments
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 21) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const DURATIONS: { value: number; labelKey: string }[] = [
  { value: 30,  labelKey: 'dur30' },
  { value: 60,  labelKey: 'dur60' },
  { value: 90,  labelKey: 'dur90' },
  { value: 120, labelKey: 'dur120' },
  { value: 150, labelKey: 'dur150' },
  { value: 180, labelKey: 'dur180' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function apiDateToStr(d: { year: number; month: number; day: number }): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function strToApiDate(s: string): { year: number; month: number; day: number } {
  const [year, month, day] = s.split('-').map(Number);
  return { year, month, day };
}

function calcEndTime(startTime: string, durationMinutes: number): string | null {
  if (!startTime) return null;
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  if (total > 21 * 60 + 30) return null;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  subjectCode: string;
  groupId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;
  durationMinutes: number;
  classroom: string;
}

interface FormErrors {
  subjectCode?: string;
  date?: string;
  startTime?: string;
  durationMinutes?: string;
}

function initState(initial?: Class): FormState {
  if (!initial) {
    return { subjectCode: '', groupId: '', date: '', startTime: '', durationMinutes: 60, classroom: '' };
  }
  return {
    subjectCode: initial.name,
    groupId: initial.groupId ?? '',
    date: apiDateToStr(initial.date),
    startTime: initial.startTime,
    durationMinutes: initial.durationMinutes,
    classroom: initial.classroom ?? '',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ClassFormProps {
  initial?: Class;
  onSubmit: (input: ClassInput) => Promise<void>;
  onClose: () => void;
}

const inputClass = `${INPUT_FIELD_CLS} h-10 w-full px-3 text-sm`;
const labelClass = 'block text-sm font-medium text-primary mb-1';
const errorClass = 'mt-1 text-xs text-error';

export function ClassForm({ initial, onSubmit, onClose }: ClassFormProps) {
  const t = useTranslations('classes');
  const [form, setForm]     = useState<FormState>(() => initState(initial));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: fetchAllSubjects,
    staleTime: 10 * 60 * 1000,
  });

  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['subject-groups', form.subjectCode],
    queryFn: () => fetchGroupsForSubject(form.subjectCode),
    enabled: !!form.subjectCode,
    staleTime: 5 * 60 * 1000,
  });

  // ── Derived options ───────────────────────────────────────────────────────

  const subjectOptions = useMemo(
    () => (subjectsData?.subjects ?? []).map((code) => ({ value: code, label: code })),
    [subjectsData],
  );

  const groupOptions = useMemo(
    () => (groupsData?.groups ?? []).map((g) => ({ value: g.id, label: g.name })),
    [groupsData],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const setVal = (field: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: field === 'durationMinutes' ? Number(val) : val }));

  function handleSubjectChange(code: string) {
    setForm((prev) => ({ ...prev, subjectCode: code, groupId: '' }));
  }

  const endTime = useMemo(
    () => (form.startTime ? calcEndTime(form.startTime, form.durationMinutes) : null),
    [form.startTime, form.durationMinutes],
  );

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.subjectCode)      errs.subjectCode     = t('errorRequired');
    if (!form.date)             errs.date            = t('errorRequired');
    if (!form.startTime)        errs.startTime       = t('errorRequired');
    if (!form.durationMinutes)  errs.durationMinutes = t('errorRequired');
    if (form.startTime && endTime === null) errs.durationMinutes = t('endTimeExceeds');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSubmit({
        name: form.subjectCode,
        groupId: form.groupId || undefined,
        date: strToApiDate(form.date),
        startTime: form.startTime,
        durationMinutes: form.durationMinutes,
        classroom: form.classroom.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal onClose={onClose} size="max-w-2xl">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold text-primary mb-5">
          {initial ? t('editClass') : t('newClass')}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Subject */}
            <Select
              label={t('fieldSubject')}
              value={form.subjectCode}
              onChange={handleSubjectChange}
              placeholder={loadingSubjects ? t('loading') : t('selectSubject')}
              options={subjectOptions}
              searchable
              error={errors.subjectCode}
              size="lg"
              disabled={loadingSubjects}
            />

            {/* Group — only visible when a subject is selected */}
            <Select
              label={t('fieldGroup')}
              value={form.groupId}
              onChange={setVal('groupId')}
              placeholder={
                !form.subjectCode
                  ? t('selectSubjectFirst')
                  : loadingGroups
                  ? t('loading')
                  : groupOptions.length === 0
                  ? t('noGroups')
                  : t('selectGroup')
              }
              options={groupOptions}
              size="lg"
              disabled={!form.subjectCode || loadingGroups || groupOptions.length === 0}
            />

            {/* Date */}
            <DatePicker
              label={t('fieldDate')}
              value={form.date}
              onChange={(val) => setForm((prev) => ({ ...prev, date: val }))}
              error={errors.date}
            />

            {/* Start time */}
            <Select
              label={t('fieldStartTime')}
              value={form.startTime}
              onChange={setVal('startTime')}
              placeholder={t('selectStartTime')}
              options={TIME_SLOTS.map((slot) => ({ value: slot, label: slot }))}
              error={errors.startTime}
              size="lg"
            />

            {/* Duration */}
            <div>
              <Select
                label={t('fieldDuration')}
                value={String(form.durationMinutes)}
                onChange={setVal('durationMinutes')}
                options={DURATIONS.map((d) => ({ value: String(d.value), label: t(d.labelKey) }))}
                error={errors.durationMinutes}
                size="lg"
              />
              {endTime && !errors.durationMinutes && (
                <p className="mt-1 text-xs text-secondary">
                  {t('endTimeLabel', { time: endTime })}
                </p>
              )}
            </div>

            {/* Classroom */}
            <div>
              <label htmlFor="class-form-classroom" className={labelClass}>{t('classroomOptional')}</label>
              <input
                id="class-form-classroom"
                type="text"
                value={form.classroom}
                onChange={(e) => setForm((prev) => ({ ...prev, classroom: e.target.value }))}
                placeholder={t('placeholderClassroom')}
                className={inputClass}
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-subtle">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSaving}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" loading={isSaving}>
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
