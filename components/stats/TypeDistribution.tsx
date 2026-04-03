'use client';

import { useTranslations } from 'next-intl';
import type { TypeStat } from '@/lib/hooks/useScheduleStats';

interface TypeDistributionProps {
  types: TypeStat[];
}

type KnownType = 'Teoría' | 'Práctica' | 'Examen' | 'Otros';

const PILL_CLS: Record<KnownType, string> = {
  'Teoría':   'bg-accent-subtle text-accent',
  'Práctica': 'bg-success-subtle text-success',
  'Examen':   'bg-error-subtle text-error',
  'Otros':    'bg-warning-subtle text-warning',
};

const BAR_CLS: Record<KnownType, string> = {
  'Teoría':   'bg-accent',
  'Práctica': 'bg-success',
  'Examen':   'bg-error',
  'Otros':    'bg-warning',
};

function pillCls(type: string): string {
  return PILL_CLS[type as KnownType] ?? 'bg-accent-subtle text-accent';
}

function barCls(type: string): string {
  return BAR_CLS[type as KnownType] ?? 'bg-accent';
}

const TYPE_KEY_MAP: Record<string, string> = {
  'Teoría':   'typeTeoria',
  'Práctica': 'typePractica',
  'Examen':   'typeExamen',
  'Otros':    'typeOtros',
};

export function TypeDistribution({ types }: TypeDistributionProps) {
  const t = useTranslations('stats');

  if (types.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {types.map((item) => (
          <span
            key={item.type}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[14px] font-medium ${pillCls(item.type)}`}
          >
            {t(TYPE_KEY_MAP[item.type] as Parameters<typeof t>[0] ?? 'typeOtros')}
            <span className="font-semibold">{item.percentage}%</span>
          </span>
        ))}
      </div>

      {/* Segmented bar */}
      <div className="flex h-2 rounded-sm overflow-hidden bg-surface-sunken">
        {types.map((item) => (
          <div
            key={item.type}
            className={barCls(item.type)}
            style={{ width: `${item.percentage}%` }}
          />
        ))}
      </div>
    </div>
  );
}
