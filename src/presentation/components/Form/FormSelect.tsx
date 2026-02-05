/**
 * FormSelect Component
 * Select de formulaire amélioré
 */

'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-slate-800 text-slate-200',
            'appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error
              ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
              : 'border-slate-700/50',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

