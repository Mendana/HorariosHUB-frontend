'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-primary">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'h-10 w-full rounded-sm bg-surface-sunken border px-4 text-sm text-primary',
            'placeholder:text-tertiary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-strong',
            error ? 'border-error' : 'border-subtle',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
