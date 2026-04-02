'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';

interface PageSizeSelectorProps {
  value: number;
  options: number[];
  onChange: (size: number) => void;
}

export function PageSizeSelector({ value, options, onChange }: PageSizeSelectorProps) {
  const t = useTranslations('common');

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-secondary">{t('pageSizeShow')}</span>
      <div className="w-[70px]">
        <Select
          size="sm"
          value={String(value)}
          options={options.map((n) => ({ value: String(n), label: String(n) }))}
          onChange={(v) => onChange(Number(v))}
          ariaLabel={t('pageSizeAriaLabel')}
        />
      </div>
      <span className="text-xs text-secondary">{t('pageSizePerPage')}</span>
    </div>
  );
}
