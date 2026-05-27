interface GroupItemProps {
  group: { id: string; name: string; selected: boolean };
  checked: boolean;
  onChange: () => void;
  /** Left-border accent color inherited from the parent subject */
  accentColor?: string;
}

/**
 * A single group row inside the SubjectItem accordion.
 *
 * Renders as a full-width toggle button instead of a detached checkbox so the
 * entire row is the hit target — easier to use on mobile.
 *
 * The group name typically looks like: "Grupo 1 — L 9-11, X 10-12"
 * We parse out a short "prefix" (e.g. "Grupo 1") and the schedule fragment
 * (everything after "—") to display them in different weights.
 */
export function GroupItem({ group, checked, onChange, accentColor }: GroupItemProps) {
  // Try to split into label + schedule info ("Grupo 1" + "L 9-11, X 10-12")
  const dashIdx    = group.name.indexOf('—');
  const label      = dashIdx >= 0 ? group.name.slice(0, dashIdx).trim() : group.name;
  const scheduleInfo = dashIdx >= 0 ? group.name.slice(dashIdx + 1).trim() : null;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={[
        'group/gi w-full flex items-center gap-2.5 px-2 py-1.5 rounded-sm text-left',
        'border-l-[2px] transition-[background-color,border-color,color] transition-fast',
        checked
          ? 'bg-accent-subtle/60 border-accent'
          : 'border-transparent hover:bg-surface-sunken hover:border-strong/30',
      ].join(' ')}
      style={checked && accentColor ? { borderLeftColor: accentColor + '80' } : undefined}
    >
      {/* Custom dot indicator */}
      <span
        aria-hidden
        className={[
          'size-[7px] rounded-full shrink-0 border transition-[background-color,border-color] transition-fast',
          checked
            ? 'border-transparent'
            : 'bg-transparent border-strong/40 group-hover/gi:border-strong/70',
        ].join(' ')}
        style={checked && accentColor ? { backgroundColor: accentColor } : undefined}
      />

      {/* Label + schedule info */}
      <span className="flex-1 min-w-0 flex items-baseline gap-2">
        <span
          className={`text-xs leading-snug transition-[color] transition-fast ${
            checked ? 'font-medium text-primary' : 'text-secondary group-hover/gi:text-primary'
          }`}
        >
          {label}
        </span>
        {scheduleInfo && (
          <span className="text-[11px] text-tertiary tabular-nums truncate shrink">
            {scheduleInfo}
          </span>
        )}
      </span>
    </button>
  );
}
