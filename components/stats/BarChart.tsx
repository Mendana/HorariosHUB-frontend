'use client';

import { useState, useEffect } from 'react';

export interface BarChartItem {
  id: string;
  label: string;
  value: number;
  subtitle: string;
  /** When true the bar renders at full accent opacity; otherwise 60% */
  isHighlighted?: boolean;
  /** Inline CSS vars for subject color (spread onto the bar fill wrapper) */
  colorVars?: React.CSSProperties;
}

interface BarChartProps {
  items: BarChartItem[];
  maxValue: number;
  /** Max items visible before "show all" button */
  visibleLimit?: number;
  showAllLabel?: string;
  showLessLabel?: string;
  /** Tailwind width class for the label column (default: w-10) */
  labelWidth?: string;
}

export function BarChart({
  items,
  maxValue,
  visibleLimit,
  showAllLabel,
  showLessLabel,
  labelWidth = 'w-10',
}: BarChartProps) {
  const [animated, setAnimated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      // Give the browser one frame to paint the 0-width bars first
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const showLimit = visibleLimit ?? items.length;
  const visible = expanded ? items : items.slice(0, showLimit);
  const hasMore = items.length > showLimit;

  return (
    <div className="flex flex-col gap-2">
      {visible.map((item, idx) => {
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const delay = idx * 80;

        return (
          <div key={item.id} className="flex items-center gap-3">
            {/* Day / subject label */}
            <span className={`${labelWidth} shrink-0 text-[13px] font-medium text-primary text-right`}>
              {item.label}
            </span>

            {/* Bar track */}
            <div className="flex-1 bg-surface-sunken rounded-sm h-2.5 overflow-hidden">
              {item.colorVars ? (
                // Subject bar — uses CSS custom properties for subject color
                <div
                  className="h-full rounded-sm"
                  style={{
                    ...item.colorVars,
                    width: animated ? `${pct}%` : '0%',
                    backgroundColor: 'var(--sb-border)',
                    transition: `width 250ms ease-in-out ${delay}ms`,
                  }}
                />
              ) : (
                // Day bar — accent color, full or 60%
                <div
                  className={item.isHighlighted ? 'h-full rounded-sm bg-accent' : 'h-full rounded-sm bg-accent/60'}
                  style={{
                    width: animated ? `${pct}%` : '0%',
                    transition: `width 250ms ease-in-out ${delay}ms`,
                  }}
                />
              )}
            </div>

            {/* Value */}
            <span className="w-24 shrink-0 text-[13px] text-secondary tabular-nums">
              {item.subtitle}
            </span>
          </div>
        );
      })}

      {hasMore && showAllLabel && showLessLabel && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start mt-1 text-[13px] text-accent hover:text-accent-hover transition-colors transition-base"
        >
          {expanded ? showLessLabel : showAllLabel}
        </button>
      )}
    </div>
  );
}
