import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-primary hover:bg-primary-dark text-white shadow-sm focus:ring-primary/40 active:scale-[0.98]',
      secondary:
        'bg-navy-900 hover:bg-navy-800 text-white shadow-sm focus:ring-navy-700/40 active:scale-[0.98]',
      accent:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-sm focus:ring-teal-500/40 active:scale-[0.98]',
      outline:
        'border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-brand-text shadow-xs focus:ring-slate-400/20 active:scale-[0.98]',
      ghost:
        'hover:bg-slate-100 text-brand-text hover:text-navy-950 focus:ring-slate-300/30',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500/40 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
