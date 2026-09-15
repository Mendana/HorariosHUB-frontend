'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { importUsersCsv } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/errors';
import type { UsersImportResult } from '@/lib/types/admin';
import { ImportResultsTable } from './ImportResultsTable';

type State = 'idle' | 'uploading' | 'success' | 'error';

export function CsvImportForm() {
  const t = useTranslations('adminTools');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<UsersImportResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setFieldError('');
    setState('idle');
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setFieldError(t('fieldRequired'));
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFieldError(t('fieldInvalidType'));
      return;
    }
    setFieldError('');

    setState('uploading');
    setErrorMsg('');
    try {
      const data = await importUsersCsv(file);
      setResult(data);
      setState('success');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="csv-file" className="text-sm font-medium text-primary">
          {t('uploadLabel')}
        </label>

        <input
          ref={fileInputRef}
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          aria-invalid={fieldError ? 'true' : undefined}
          aria-describedby={fieldError ? 'csv-file-error' : 'csv-file-hint'}
          className={[
            'block w-full text-sm text-secondary cursor-pointer',
            'file:mr-3 file:h-9 file:px-4 file:rounded-sm file:border-0 file:cursor-pointer',
            'file:bg-accent file:text-white file:text-sm file:font-medium',
            'file:transition-[filter] hover:file:brightness-[1.08]',
          ].join(' ')}
        />

        {fieldError ? (
          <p id="csv-file-error" role="alert" className="text-xs text-error">{fieldError}</p>
        ) : (
          <p id="csv-file-hint" className="text-xs text-tertiary">{t('uploadHint')}</p>
        )}
      </div>

      <div className="mt-3">
        <Button type="submit" variant="primary" size="sm" iconLeft={state !== 'uploading' ? Upload : undefined} loading={state === 'uploading'}>
          {t('uploadButton')}
        </Button>
      </div>

      {state === 'error' && (
        <div className="mt-4 flex items-center justify-between gap-4 px-4 py-3 rounded-sm bg-error-subtle border border-error/40">
          <p className="text-sm text-error">{errorMsg}</p>
          <button
            type="button"
            onClick={() => { setState('idle'); setErrorMsg(''); }}
            className="shrink-0 text-sm font-medium text-error hover:underline"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {state === 'success' && result && <ImportResultsTable result={result} />}
    </form>
  );
}
