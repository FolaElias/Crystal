import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold tracking-widest uppercase text-neon-cyan/70">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-neon-cyan transition-colors">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-crystal-surface px-4 py-2 text-sm text-foreground',
              'border-crystal-border',
              'placeholder:text-muted-foreground/50',
              'transition-all duration-200',
              'focus:outline-none focus:border-neon-cyan/60 focus:shadow-neon-cyan focus:bg-crystal-card',
              'hover:border-neon-cyan/30',
              'disabled:cursor-not-allowed disabled:opacity-40',
              icon && 'pl-10',
              error && 'border-neon-red/60 focus:border-neon-red focus:shadow-neon-red',
              className
            )}
            ref={ref}
            {...props}
          />
          {/* animated bottom line */}
          <div className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-neon-cyan transition-all duration-300',
            'group-focus-within:w-full',
            error && 'bg-neon-red group-focus-within:bg-neon-red'
          )} />
        </div>
        {error && (
          <p className="text-xs text-neon-red flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-neon-red" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
