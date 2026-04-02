'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Class, ClassInput, ClassType } from '@/lib/types/classes';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';

// ── Subject list (hardcoded PCEO catalogue) ───────────────────────────────────

export const PCEO_SUBJECTS: { code: string; name: string }[] = [
  // Matemáticas — gama fría
  { code: 'ALG',  name: 'Álgebra Lineal' },
  { code: 'CDI',  name: 'Cálculo Diferencial e Integral' },
  { code: 'GEO',  name: 'Geometría' },
  { code: 'TOP',  name: 'Topología' },
  { code: 'ANA',  name: 'Análisis Matemático' },
  { code: 'ALB',  name: 'Álgebra' },
  { code: 'EST',  name: 'Estadística y Probabilidad' },
  { code: 'EDP',  name: 'Ecuaciones Diferenciales' },
  { code: 'MN',   name: 'Métodos Numéricos' },
  { code: 'TN',   name: 'Teoría de Números' },
  { code: 'GDF',  name: 'Geometría Diferencial' },
  { code: 'AMV',  name: 'Análisis en Varias Variables' },
  // Informática — gama cálida
  { code: 'PRG',  name: 'Programación' },
  { code: 'EDT',  name: 'Estructuras de Datos' },
  { code: 'BDA',  name: 'Bases de Datos' },
  { code: 'SO',   name: 'Sistemas Operativos' },
  { code: 'RS',   name: 'Redes de Computadores' },
  { code: 'IA',   name: 'Inteligencia Artificial' },
  { code: 'IS',   name: 'Ingeniería del Software' },
  { code: 'ARC',  name: 'Arquitectura de Computadores' },
  { code: 'CO',   name: 'Compiladores' },
  { code: 'LP',   name: 'Lenguajes de Programación' },
  { code: 'IHC',  name: 'Interacción Humano-Computadora' },
  { code: 'TFG',  name: 'Trabajo Fin de Grado' },
];

const CLASS_TYPES: ClassType[] = ['Teoría', 'Práctica', 'Examen', 'Otros'];

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
  name: string;
  type: string;
  date: string;       // YYYY-MM-DD
  startTime: string;
  durationMinutes: number;
  classroom: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  date?: string;
  startTime?: string;
  durationMinutes?: string;
}

function initState(initial?: Class): FormState {
  if (!initial) return { name: '', type: '', date: '', startTime: '', durationMinutes: 60, classroom: '' };
  return {
    name: initial.name,
    type: initial.type,
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

  // For native <input> elements
  const set = (field: 'classroom') =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  // For Select components
  const setVal = (field: keyof FormState) => (val: string) =>
    setForm(prev => ({
      ...prev,
      [field]: field === 'durationMinutes' ? Number(val) : val,
    }));

  const endTime = useMemo(
    () => (form.startTime ? calcEndTime(form.startTime, form.durationMinutes) : null),
    [form.startTime, form.durationMinutes],
  );

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.name)          errs.name          = t('errorRequired');
    if (!form.type)          errs.type          = t('errorRequired');
    if (!form.date)          errs.date          = t('errorRequired');
    if (!form.startTime)     errs.startTime     = t('errorRequired');
    if (!form.durationMinutes) errs.durationMinutes = t('errorRequired');
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
        name: form.name,
        type: form.type as ClassType,
        date: strToApiDate(form.date),
        startTime: form.startTime,
        durationMinutes: form.durationMinutes,
        classroom: form.classroom.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} size="max-w-2xl">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold text-primary mb-5">
          {initial ? t('editClass') : t('newClass')}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Subject — searchable (24 options) */}
            <Select
              label={t('fieldSubject')}
              value={form.name}
              onChange={setVal('name')}
              placeholder={t('selectSubject')}
              options={PCEO_SUBJECTS.map(s => ({
                value: s.code,
                label: `${s.code} — ${s.name}`,
              }))}
              searchable
              error={errors.name}
              size="lg"
            />

            {/* Type */}
            <Select
              label={t('fieldType')}
              value={form.type}
              onChange={setVal('type')}
              placeholder={t('selectType')}
              options={CLASS_TYPES.map(type => ({ value: type, label: type }))}
              error={errors.type}
              size="lg"
            />

            {/* Date */}
            <DatePicker
              label={t('fieldDate')}
              value={form.date}
              onChange={val => setForm(prev => ({ ...prev, date: val }))}
              error={errors.date}
            />

            {/* Start time */}
            <Select
              label={t('fieldStartTime')}
              value={form.startTime}
              onChange={setVal('startTime')}
              placeholder={t('selectStartTime')}
              options={TIME_SLOTS.map(slot => ({ value: slot, label: slot }))}
              error={errors.startTime}
              size="lg"
            />

            {/* Duration */}
            <div>
              <Select
                label={t('fieldDuration')}
                value={String(form.durationMinutes)}
                onChange={setVal('durationMinutes')}
                options={DURATIONS.map(d => ({ value: String(d.value), label: t(d.labelKey) }))}
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
                onChange={set('classroom')}
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
