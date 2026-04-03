'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ScheduleStats } from '@/lib/hooks/useScheduleStats';

interface AutoInsightProps {
  stats: ScheduleStats;
}

const TYPE_KEY_MAP: Record<string, string> = {
  'Teoría':   'typeTeoria',
  'Práctica': 'typePractica',
  'Examen':   'typeExamen',
  'Otros':    'typeOtros',
};

export function AutoInsight({ stats }: AutoInsightProps) {
  const t = useTranslations('stats');
  const tSchedule = useTranslations('schedule');

  const insights: string[] = [];

  // Insight 1 — busiest day
  insights.push(
    t('insightBusiestDay', {
      day: tSchedule(stats.diaMasOcupado as Parameters<typeof tSchedule>[0]),
      hours: stats.diaMasOcupadoHoras,
    }),
  );

  // Insight 2 — most common class type
  if (stats.tipoMasFrecuente) {
    const typeKey = TYPE_KEY_MAP[stats.tipoMasFrecuente.type];
    insights.push(
      t('insightMainType', {
        percent: stats.tipoMasFrecuente.percentage,
        type: typeKey ? t(typeKey as Parameters<typeof t>[0]) : stats.tipoMasFrecuente.type,
      }),
    );
  }

  // Insight 3 — free afternoon (conditional)
  if (stats.diaConTardeLibre) {
    insights.push(
      t('insightFreeAfternoon', {
        day: tSchedule(stats.diaConTardeLibre as Parameters<typeof tSchedule>[0]),
      }),
    );
  } else {
    // Fallback: earliest start time
    insights.push(t('insightEarlyStart', { time: stats.horaStart }));
  }

  return (
    <div className="flex gap-3 bg-surface-raised border border-subtle rounded-md p-5">
      <Sparkles size={18} className="shrink-0 mt-0.5 text-accent" aria-hidden />
      <div className="flex flex-col gap-1.5">
        {insights.map((text, i) => (
          <p key={i} className="text-[14px] text-secondary leading-relaxed">
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
