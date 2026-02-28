import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { type IconType } from 'react-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: IconType;
  rightIcon?: IconType;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[#D60000] text-white hover:bg-[#b00000] active:bg-[#900000] shadow-sm',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  outline:
    'border-2 border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
};

const sizes: Record<string, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading = false,
      fullWidth,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#D60000] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const cls = [
      base,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cls}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {LeftIcon && <LeftIcon className="shrink-0" size={size === 'sm' ? 16 : 20} />}
            {children}
            {RightIcon && <RightIcon className="shrink-0" size={size === 'sm' ? 16 : 20} />}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
