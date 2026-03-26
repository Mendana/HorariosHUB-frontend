'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const DEGREES = [
  { key: 'mat',    labelKey: 'degreeMat'    },
  { key: 'inf',    labelKey: 'degreeInf'    },
  { key: 'fis',    labelKey: 'degreeFis'    },
  { key: 'infmat', labelKey: 'degreeInfmat' },
  { key: 'fismat', labelKey: 'degreeFismat' },
  { key: 'matfis', labelKey: 'degreeMatfis' },
] as const;

const YEARS = [
  { suffix: 'primero',  labelKey: 'yearFirst'  },
  { suffix: 'segundo',  labelKey: 'yearSecond' },
  { suffix: 'tercero',  labelKey: 'yearThird'  },
  { suffix: 'cuarto',   labelKey: 'yearFourth' },
  { suffix: 'quinto',   labelKey: 'yearFifth'  },
] as const;

interface ScheduleSearchProps {
  identifier: string | null;
  onIdentifierChange: (id: string) => void;
}

export function ScheduleSearch({ identifier, onIdentifierChange }: ScheduleSearchProps) {
  const t = useTranslations('schedule');
  const [uoInput, setUoInput] = useState('');
  const [degree, setDegree]   = useState<string>('inf');

  function handleUoSearch() {
    const val = uoInput.trim().toLowerCase();
    if (val && val !== identifier) onIdentifierChange(val);
  }

  function handleYearSelect(suffix: string) {
    const newId = `${degree}${suffix}`;
    if (newId !== identifier) onIdentifierChange(newId);
  }

  return (
    <div className="flex flex-col gap-3 py-3 px-1">
      {/* Row 1: UO input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={uoInput}
          onChange={e => setUoInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUoSearch()}
          placeholder={t('searchPlaceholder')}
          className={`${INPUT_FIELD_CLS} h-9 w-28 px-3 text-sm`}
        />
        <Button
          variant="primary"
          onClick={handleUoSearch}
          iconLeft={Search}
          aria-label={t('searchButton')}
        />
      </div>

      {/* Row 2: degree selector + year chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={degree}
          onChange={setDegree}
          options={DEGREES.map(d => ({ value: d.key, label: t(d.labelKey) }))}
          ariaLabel={t('degreeLabel')}
          size="sm"
        />

        <div className="flex gap-1 flex-wrap">
          {YEARS.map(y => {
            const id     = `${degree}${y.suffix}`;
            const active = identifier === id;
            return (
              <button
                key={y.suffix}
                onClick={() => handleYearSelect(y.suffix)}
                className={`px-3 py-1 text-sm rounded-sm border transition-colors ${
                  active
                    ? 'bg-accent-subtle border-accent text-accent font-medium'
                    : 'border-subtle text-secondary hover:text-primary hover:border-strong'
                }`}
              >
                {t(y.labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
