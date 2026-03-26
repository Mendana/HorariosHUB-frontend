import { Checkbox } from '@/components/ui/Checkbox';
import type { SubjectGroup } from '@/lib/types/subjects';

interface GroupItemProps {
  group: SubjectGroup;
  checked: boolean;
  onChange: () => void;
}

export function GroupItem({ group, checked, onChange }: GroupItemProps) {
  return (
    <div className="py-2">
      <Checkbox
        checked={checked}
        onChange={() => onChange()}
        label={group.name}
      />
    </div>
  );
}
