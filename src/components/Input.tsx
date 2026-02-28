import { forwardRef } from 'react';
import { type IconType } from 'react-icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconType;
  rightIcon?: IconType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasIcon = LeftIcon || RightIcon;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <LeftIcon size={20} />
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border bg-white py-2.5 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500',
              hasIcon && LeftIcon && 'pl-10',
              hasIcon && RightIcon && 'pr-10',
              !hasIcon && 'px-4',
              error
                ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                : 'border-slate-200 dark:border-slate-600',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {RightIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <RightIcon size={20} />
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
