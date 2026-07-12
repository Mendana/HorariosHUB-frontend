'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Clock, TrendingUp, Sunrise, Sunset, CalendarDays } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useScheduleStats } from '@/lib/hooks/useScheduleStats';
import { getSubjectColorVars } from '@/lib/config/subjectColors';
import { getCurrentSemester } from '@/lib/utils/scheduleHelpers';
import { StatCard } from '@/components/stats/StatCard';
import { BarChart } from '@/components/stats/BarChart';
import type { BarChartItem } from '@/components/stats/BarChart';
import { AutoInsight } from '@/components/stats/AutoInsight';

// ── helpers ───────────────────────────────────────────────────────────────────

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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-raised rounded-md h-24 border border-subtle" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-3 bg-surface-raised rounded-sm" />
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

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (user === null) router.push('/auth/login');
  }, [user, authLoading, router]);

  // Identifier from localStorage — written by the schedule page
  const [identifier, setIdentifier] = useState<string | null>(null);
  useEffect(() => {
    const stored = readStorage<string | null>('scheduleIdentifier', null);
    setIdentifier(stored);
  }, []);

  // Semester state — shared key with WeekNavigator
  const [semester, setSemester] = useState<1 | 2>(getCurrentSemester);
  useEffect(() => {
    setSemester(readStorage<1 | 2>('selectedSemester', getCurrentSemester()));
  }, []);

  const { subjects, isLoading } = useSchedule(identifier);
  const stats = useScheduleStats(subjects, semester);

  // ── bar chart items: by day ──────────────────────────────────────────────
  const dayItems: BarChartItem[] = useMemo(
    () =>
      stats.distribucionPorDia.map((d) => ({
        id: d.dayKey,
        label: tSchedule(d.dayKey as Parameters<typeof tSchedule>[0]),
        value: d.hours,
        subtitle: t('hoursClasses', { hours: d.hours, classes: d.classes }),
        isHighlighted: d.dayKey === stats.diaMasOcupado,
      })),
    [stats.distribucionPorDia, stats.diaMasOcupado, t, tSchedule],
  );

  const maxDayHours = useMemo(
    () => Math.max(...stats.distribucionPorDia.map((d) => d.hours), 0.1),
    [stats.distribucionPorDia],
  );

  // ── bar chart items: by subject ──────────────────────────────────────────
  const subjectItems: BarChartItem[] = useMemo(
    () =>
      stats.horasPorAsignatura.map((s) => ({
        id: s.name,
        label: s.name,
        value: s.hours,
        subtitle: t('hoursClasses', { hours: s.hours, classes: `${s.percentage}%` }),
        colorVars: getSubjectColorVars(s.name),
      })),
    [stats.horasPorAsignatura, t],
  );

  const maxSubjectHours = useMemo(
    () => Math.max(...stats.horasPorAsignatura.map((s) => s.hours), 0.1),
    [stats.horasPorAsignatura],
  );

  if (authLoading || user === null) return null;

  // ── no identifier state ──────────────────────────────────────────────────
  if (!identifier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <CalendarDays size={32} className="text-tertiary" aria-hidden />
        <p className="text-[15px] font-medium text-primary">{t('noSchedule')}</p>
        <p className="text-[13px] text-secondary max-w-sm">{t('noScheduleHint')}</p>
        <Link
          href="/"
          className="px-4 py-2 text-[13px] font-medium text-accent hover:text-accent-hover transition-colors transition-base"
        >
          {t('noScheduleLink')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pb-12">
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <div className="py-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-[22px] font-semibold text-primary">{t('title')}</h1>

          {/* Semester selector — patrón tray consistente con WeekNavigator */}
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

        {!isLoading && stats.totalClases > 0 && (
          <p className="text-[13px] text-secondary">
            {t('subtitle', { classes: stats.totalClases, hours: stats.totalHoras })}
          </p>
        )}
      </div>

      {/* ── loading ─────────────────────────────────────────────────────────── */}
      {isLoading && <StatsSkeleton />}

      {/* ── empty semester ──────────────────────────────────────────────────── */}
      {!isLoading && stats.totalClases === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
          <CalendarDays size={28} className="text-tertiary" aria-hidden />
          <p className="text-[14px] text-secondary">{t('noData')}</p>
        </div>
      )}

      {/* ── content ─────────────────────────────────────────────────────────── */}
      {!isLoading && stats.totalClases > 0 && (
        <div className="flex flex-col gap-10">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={Clock}
              value={`${stats.horasPorSemana} h`}
              label={t('cardWeeklyHours')}
            />
            <StatCard
              icon={TrendingUp}
              value={tSchedule(stats.diaMasOcupado as Parameters<typeof tSchedule>[0])}
              label={t('cardBusiestDay', {
                hours: stats.diaMasOcupadoHoras,
                classes: stats.diaMasOcupadoClases,
              })}
            />
            <StatCard
              icon={Sunrise}
              value={stats.horaStart}
              label={t('cardFirstClass')}
            />
            <StatCard
              icon={Sunset}
              value={stats.horaEnd}
              label={t('cardLastClass')}
            />
          </div>

          {/* By day */}
          <section aria-labelledby="section-day">
            <h2
              id="section-day"
              className="text-[17px] font-medium text-primary mb-4"
            >
              {t('sectionByDay')}
            </h2>
            <BarChart items={dayItems} maxValue={maxDayHours} />
          </section>

          {/* By subject */}
          <section aria-labelledby="section-subject">
            <h2
              id="section-subject"
              className="text-[17px] font-medium text-primary mb-4"
            >
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

          {/* Auto insight */}
          <section aria-labelledby="section-insight">
            <h2
              id="section-insight"
              className="text-[17px] font-medium text-primary mb-4"
            >
              {t('sectionInsight')}
            </h2>
            <AutoInsight stats={stats} />
          </section>
        </div>
      )}
    </div>
  );
}
