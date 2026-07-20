'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Clock, TrendingUp, Sunrise, Sunset, CalendarDays, CheckCircle, BookOpen, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserMetrics } from '@/lib/hooks/useUserMetrics';
import { getSubjectColorVars } from '@/lib/config/subjectColors';
import { getCurrentSemester } from '@/lib/utils/scheduleHelpers';
import { StatCard } from '@/components/stats/StatCard';
import { BarChart } from '@/components/stats/BarChart';
import type { BarChartItem } from '@/components/stats/BarChart';
import { AutoInsight } from '@/components/stats/AutoInsight';
import type { SessionType } from '@/lib/types/metrics';

// Maps API weekday number (1=Mon…5=Fri) to i18n key in 'schedule' namespace
const DAY_KEYS = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri'] as const;

// Maps session_type to i18n key in 'stats' namespace
function typeKey(t: SessionType): string {
  const map: Record<SessionType, string> = {
    teoria:      'typeTeoria',
    laboratorio: 'typeLaboratorio',
    practica:    'typePractica',
    tutoria:     'typeTutoria',
    otros:       'typeOtros',
  };
  return map[t] ?? 'typeOtros';
}

function trimTime(t: string | null): string {
  if (!t) return '-';
  return t.slice(0, 5); // "09:00:00" → "09:00"
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ── skeleton ──────────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-raised rounded-md h-24 border border-subtle" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 h-3 bg-surface-raised rounded-sm" />
            <div
              className="h-2.5 bg-surface-raised rounded-sm"
              style={{ width: `${40 + i * 10}%` }}
            />
            <div className="w-20 h-3 bg-surface-raised rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const t = useTranslations('stats');
  const tSchedule = useTranslations('schedule');
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user === null) router.push('/auth/login');
  }, [user, authLoading, router]);

  const [semester, setSemester] = useState<1 | 2>(getCurrentSemester);
  useEffect(() => {
    setSemester(readStorage<1 | 2>('selectedSemester', getCurrentSemester()));
  }, []);

  const { metrics, isLoading, isError, refetch } = useUserMetrics(semester);

  // ── bar chart: by day ────────────────────────────────────────────────────
  const dayItems: BarChartItem[] = useMemo(() => {
    const byDay = new Map(metrics?.by_weekday.map((d) => [d.weekday, d]) ?? []);
    return DAY_KEYS.map((key, i) => {
      const d = byDay.get(i + 1);
      return {
        id: key,
        label: tSchedule(key as Parameters<typeof tSchedule>[0]),
        value: d?.hours ?? 0,
        subtitle: d
          ? t('hoursClasses', { hours: d.hours, classes: d.class_count })
          : t('hoursClasses', { hours: 0, classes: 0 }),
        isHighlighted: !!(d && d.hours > 0 && d.hours === Math.max(...(metrics?.by_weekday.map((x) => x.hours) ?? [0]))),
      };
    });
  }, [metrics, t, tSchedule]);

  const maxDayHours = useMemo(
    () => Math.max(...(metrics?.by_weekday.map((d) => d.hours) ?? [0]), 0.1),
    [metrics],
  );

  // ── bar chart: by subject ────────────────────────────────────────────────
  const subjectItems: BarChartItem[] = useMemo(
    () =>
      (metrics?.by_subject ?? []).map((s) => ({
        id: s.subject,
        label: s.subject,
        value: s.hours,
        subtitle: t('hoursClasses', { hours: s.hours, classes: `${Math.round(s.percentage)}%` }),
        colorVars: getSubjectColorVars(s.subject),
      })),
    [metrics, t],
  );

  const maxSubjectHours = useMemo(
    () => Math.max(...(metrics?.by_subject.map((s) => s.hours) ?? [0]), 0.1),
    [metrics],
  );

  // ── bar chart: by type ───────────────────────────────────────────────────
  const typeItems: BarChartItem[] = useMemo(
    () =>
      (metrics?.by_type ?? []).map((item) => ({
        id: item.session_type,
        label: t(typeKey(item.session_type) as Parameters<typeof t>[0]),
        value: item.hours,
        subtitle: t('hoursClasses', { hours: item.hours, classes: item.class_count }),
      })),
    [metrics, t],
  );

  const maxTypeHours = useMemo(
    () => Math.max(...(metrics?.by_type.map((x) => x.hours) ?? [0]), 0.1),
    [metrics],
  );

  // ── AutoInsight data ─────────────────────────────────────────────────────
  const insightStats = useMemo(() => {
    const busiestDay = metrics?.by_weekday.reduce(
      (max, d) => (d.hours > max.hours ? d : max),
      { weekday: 1, hours: 0, class_count: 0 },
    );
    const diaMasOcupado = DAY_KEYS[(busiestDay?.weekday ?? 1) - 1];
    const distribucionPorDia = DAY_KEYS.map((dayKey, i) => {
      const d = new Map(metrics?.by_weekday.map((x) => [x.weekday, x]) ?? []).get(i + 1);
      return { dayKey, hours: d?.hours ?? 0, classes: d?.class_count ?? 0 };
    });
    return {
      horasPorSemana: metrics?.weekly_average_hours ?? 0,
      horasPorAsignatura: (metrics?.by_subject ?? []).map((s) => ({
        name: s.subject,
        hours: s.hours,
        percentage: Math.round(s.percentage),
      })),
      distribucionPorDia,
      diaMasOcupado,
      diaMasLibre: 'dayFri' as const,
      diaMasOcupadoHoras: busiestDay?.hours ?? 0,
      diaMasOcupadoClases: busiestDay?.class_count ?? 0,
      horaStart: trimTime(metrics?.earliest_start_time ?? null),
      horaEnd: trimTime(metrics?.latest_end_time ?? null),
      totalClases: (metrics?.completed_classes ?? 0) + (metrics?.remaining_classes ?? 0),
      totalHoras: metrics?.total_hours ?? 0,
      semanaActual: { hours: 0, classes: 0 },
      diaConTardeLibre: null,
    };
  }, [metrics]);

  const hasData = (metrics?.total_hours ?? 0) > 0;

  if (authLoading || user === null) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pb-12">
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <div className="py-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-[22px] font-semibold text-primary">{t('title')}</h1>

          <div className="flex gap-0.5 p-0.5 rounded-sm bg-surface-raised">
            {([1, 2] as const).map((sem) => (
              <button
                key={sem}
                type="button"
                aria-pressed={semester === sem}
                onClick={() => setSemester(sem)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-[3px] transition-[background-color,color,box-shadow] transition-base ${
                  semester === sem
                    ? 'bg-surface-base text-primary shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tSchedule(sem === 1 ? 'semester1' : 'semester2')}
              </button>
            ))}
          </div>
        </div>

        {!isLoading && hasData && (
          <p className="text-[13px] text-secondary">
            {t('subtitle', {
              classes: (metrics?.completed_classes ?? 0) + (metrics?.remaining_classes ?? 0),
              hours: metrics?.total_hours ?? 0,
            })}
          </p>
        )}
      </div>

      {/* ── loading ─────────────────────────────────────────────────────────── */}
      {isLoading && <StatsSkeleton />}

      {/* ── error ───────────────────────────────────────────────────────────── */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <RefreshCw size={28} className="text-tertiary" aria-hidden />
          <p className="text-[14px] text-secondary">{t('noData')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-[13px] text-accent hover:text-accent-hover transition-colors transition-base"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* ── empty ───────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && !hasData && (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
          <CalendarDays size={28} className="text-tertiary" aria-hidden />
          <p className="text-[14px] text-secondary">{t('noData')}</p>
        </div>
      )}

      {/* ── content ─────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && hasData && (
        <div className="flex flex-col gap-10">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={Clock}
              value={`${metrics?.weekly_average_hours ?? 0} h`}
              label={t('cardWeeklyHours')}
            />
            <StatCard
              icon={TrendingUp}
              value={tSchedule(insightStats.diaMasOcupado as Parameters<typeof tSchedule>[0])}
              label={t('cardBusiestDay', {
                hours: insightStats.diaMasOcupadoHoras,
                classes: insightStats.diaMasOcupadoClases,
              })}
            />
            <StatCard
              icon={Sunrise}
              value={trimTime(metrics?.earliest_start_time ?? null)}
              label={t('cardFirstClass')}
            />
            <StatCard
              icon={Sunset}
              value={trimTime(metrics?.latest_end_time ?? null)}
              label={t('cardLastClass')}
            />
            <StatCard
              icon={CheckCircle}
              value={String(metrics?.completed_classes ?? 0)}
              label={t('cardCompleted')}
            />
            <StatCard
              icon={BookOpen}
              value={String(metrics?.remaining_classes ?? 0)}
              label={t('cardRemaining')}
            />
          </div>

          {/* By day */}
          <section aria-labelledby="section-day">
            <h2 id="section-day" className="text-[17px] font-medium text-primary mb-4">
              {t('sectionByDay')}
            </h2>
            <BarChart items={dayItems} maxValue={maxDayHours} />
          </section>

          {/* By subject */}
          {subjectItems.length > 0 && (
            <section aria-labelledby="section-subject">
              <h2 id="section-subject" className="text-[17px] font-medium text-primary mb-4">
                {t('sectionBySubject')}
              </h2>
              <BarChart
                items={subjectItems}
                maxValue={maxSubjectHours}
                visibleLimit={10}
                showAllLabel={t('showAll')}
                showLessLabel={t('showLess')}
              />
            </section>
          )}

          {/* By type */}
          {typeItems.length > 0 && (
            <section aria-labelledby="section-type">
              <h2 id="section-type" className="text-[17px] font-medium text-primary mb-4">
                {t('sectionByType')}
              </h2>
              <BarChart items={typeItems} maxValue={maxTypeHours} labelWidth="w-20" />
            </section>
          )}

          {/* Auto insight */}
          <section aria-labelledby="section-insight">
            <h2 id="section-insight" className="text-[17px] font-medium text-primary mb-4">
              {t('sectionInsight')}
            </h2>
            <AutoInsight stats={insightStats} />
          </section>
        </div>
      )}
    </div>
  );
}
