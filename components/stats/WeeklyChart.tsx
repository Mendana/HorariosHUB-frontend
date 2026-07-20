'use client';

import { useState, useEffect } from 'react';
import type { WeeklyMetric } from '@/lib/types/metrics';

interface WeeklyChartProps {
  items: WeeklyMetric[];
  completedLabel: string;
  remainingLabel: string;
}

function formatWeekLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d)}/${parseInt(m)}`;
}

const BAR_MAX_PX = 96;

export function WeeklyChart({ items, completedLabel, remainingLabel }: WeeklyChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const maxHours = Math.max(...items.map((w) => w.total_hours), 0.1);

  return (
    <div className="overflow-x-auto pb-1">
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-[12px] text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-accent inline-block" />
          {completedLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/40 inline-block" />
          {remainingLabel}
        </span>
      </div>

      {/* Columns */}
      <div
        className="flex items-end gap-1"
        style={{ minWidth: `${items.length * 36}px` }}
        role="img"
        aria-label={`${completedLabel} / ${remainingLabel}`}
      >
        {items.map((week, idx) => {
          const pct = week.total_hours / maxHours;
          const totalH = pct * BAR_MAX_PX;
          const completedRatio =
            week.class_count > 0 ? week.completed_classes / week.class_count : 0;
          const completedH = totalH * completedRatio;
          const remainingH = totalH - completedH;
          const delay = idx * 25;
          const label = formatWeekLabel(week.week_start);

          return (
            <div
              key={`${week.iso_year}-${week.iso_week}`}
              className="flex flex-col items-center gap-1 flex-1 min-w-[28px]"
            >
              {/* Track */}
              <div
                className="relative w-full bg-surface-sunken rounded-t-sm"
                style={{ height: `${BAR_MAX_PX}px` }}
                title={`${week.week_start}: ${week.total_hours} h`}
              >
                {/* Stacked from bottom via flex-col-reverse */}
                <div className="absolute inset-0 flex flex-col-reverse overflow-hidden rounded-t-sm">
                  {/* completed (bottom) */}
                  <div
                    className="w-full shrink-0 bg-accent"
                    style={{
                      height: animated ? `${completedH}px` : '0px',
                      transition: `height 300ms ease-out ${delay}ms`,
                    }}
                  />
                  {/* remaining (above) */}
                  <div
                    className="w-full shrink-0 bg-accent/40"
                    style={{
                      height: animated ? `${remainingH}px` : '0px',
                      transition: `height 300ms ease-out ${delay}ms`,
                    }}
                  />
                </div>
              </div>

              {/* Date label */}
              <span className="text-[9px] text-tertiary tabular-nums leading-tight text-center">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
