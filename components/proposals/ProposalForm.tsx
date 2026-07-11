'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';
import { timeToMinutes } from '@/lib/utils/scheduleHelpers';
import { createProposal } from '@/lib/api/proposals';
import { getErrorMessage } from '@/lib/errors';

// Time slots 08:00–21:00 in 30-min increments
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 21) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const DURATIONS: { value: number; labelKey: string }[] = [
  { value: 30, labelKey: 'dur30' },
  { value: 60, labelKey: 'dur60' },
  { value: 90, labelKey: 'dur90' },
  { value: 120, labelKey: 'dur120' },
  { value: 150, labelKey: 'dur150' },
  { value: 180, labelKey: 'dur180' },
];

function dateToStr(d: { year: number; month: number; day: number }): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

type ProposalAction = 'modify' | 'delete';

interface UpdateFields {
  classroom: string;
  date: string;       // YYYY-MM-DD
  startTime: string;
  durationMinutes: number;
}

interface ProposalFormProps {
  subject: SubjectWithLayout;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls = `${INPUT_FIELD_CLS} h-10 w-full px-3 text-sm`;
const labelCls = 'block text-sm font-medium text-primary mb-1';

export function ProposalForm({ subject, onClose, onSuccess }: ProposalFormProps) {
  const t = useTranslations('proposals');
  const tc = useTranslations('classes');

  const initDuration = timeToMinutes(subject.endTime) - timeToMinutes(subject.startTime);

  const [action, setAction] = useState<ProposalAction>('modify');
  const [fields, setFields] = useState<UpdateFields>({
    classroom: subject.classroom ?? '',
    date: dateToStr(subject.date),
    startTime: subject.startTime,
    durationMinutes: initDuration,
  });
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function setField(key: keyof UpdateFields) {
    return (val: string) =>
      setFields(prev => ({
        ...prev,
        [key]: key === 'durationMinutes' ? Number(val) : val,
      }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    try {
      if (action === 'modify') {
        const [year, month, day] = fields.date.split('-').map(Number);
        const [h, m] = fields.startTime.split(':').map(Number);
        const newStartsAt = new Date(Date.UTC(year, month - 1, day, h, m)).toISOString();
        await createProposal({
          changeType: 'modify',
          changes: {
            sessionId: subject.id,
            newStartsAt,
            newDuration: fields.durationMinutes,
            newClassroom: fields.classroom || undefined,
          },
        });
      } else {
        await createProposal({
          changeType: 'delete',
          changes: { sessionId: subject.id },
        });
      }
      onSuccess();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const actionOptions = [
    { value: 'modify', label: t('proposeUpdate') },
    { value: 'delete', label: t('proposeDelete') },
  ];

  // ── Form ──────────────────────────────────────────────────────────────────────
  return (
    <Modal onClose={onClose} size="max-w-lg">
      <div className="px-6 py-5">
        <h2 className="text-base font-semibold text-primary mb-1">{t('proposeTitle')}</h2>
        <p className="text-sm text-secondary mb-4">{subject.name}</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Action type */}
          <div className="mb-5">
            <Select
              label={t('proposeTypeLabel')}
              value={action}
              onChange={(val) => setAction(val as ProposalAction)}
              options={actionOptions}
              size="lg"
            />
          </div>

          {/* Update fields */}
          {action === 'modify' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="proposal-classroom" className={labelCls}>{t('diffFieldClassroom')}</label>
                <input
                  id="proposal-classroom"
                  type="text"
                  value={fields.classroom}
                  onChange={e => setFields(prev => ({ ...prev, classroom: e.target.value }))}
                  placeholder={tc('placeholderClassroom')}
                  className={inputCls}
                />
              </div>

              <DatePicker
                label={t('diffFieldDate')}
                value={fields.date}
                onChange={val => setFields(prev => ({ ...prev, date: val }))}
              />

              <Select
                label={t('diffFieldStartTime')}
                value={fields.startTime}
                onChange={setField('startTime')}
                options={TIME_SLOTS.map(s => ({ value: s, label: s }))}
                size="lg"
              />

              <Select
                label={t('diffFieldDuration')}
                value={String(fields.durationMinutes)}
                onChange={setField('durationMinutes')}
                options={DURATIONS.map(d => ({ value: String(d.value), label: tc(d.labelKey) }))}
                size="lg"
              />
            </div>
          )}

          {/* Delete confirmation */}
          {action === 'delete' && (
            <div className="mb-5">
              <label htmlFor="proposal-reason" className={labelCls}>{t('proposeReasonLabel')}</label>
              <textarea
                id="proposal-reason"
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder={t('rejectReasonPlaceholder')}
                rows={3}
                className={`${INPUT_FIELD_CLS} w-full px-3 py-2 text-sm resize-none`}
              />
            </div>
          )}

          {/* API error */}
          {apiError && (
            <div role="alert" className="mb-4 px-3 py-2 rounded-sm bg-error-subtle border border-error text-sm text-error">
              {apiError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-subtle">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              {tc('cancel')}
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              {t('proposeSubmit')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
