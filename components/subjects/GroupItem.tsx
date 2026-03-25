import type { SubjectGroup } from '@/lib/types/subjects';

interface GroupItemProps {
  group: SubjectGroup;
  checked: boolean;
  onChange: () => void;
}

export function GroupItem({ group, checked, onChange }: GroupItemProps) {
  return (
    <label className="flex items-center gap-2.5 py-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer rounded-sm"
        style={{ accentColor: 'var(--accent)' }}
      />
      <span className={`text-sm ${checked ? 'text-primary' : 'text-secondary'}`}>
        {group.name}
      </span>
    </label>
  );
}
