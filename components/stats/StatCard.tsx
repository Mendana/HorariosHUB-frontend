'use client';

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="relative bg-surface-raised border border-subtle rounded-md p-6 shadow-sm hover:shadow-md transition-[box-shadow] transition-base">
      <Icon
        size={20}
        className="absolute top-5 right-5 text-tertiary"
        aria-hidden
      />
      <p className="text-[32px] font-semibold leading-none text-accent tabular-nums">
        {value}
      </p>
      <p className="text-[13px] text-secondary mt-2">{label}</p>
    </div>
  );
}
