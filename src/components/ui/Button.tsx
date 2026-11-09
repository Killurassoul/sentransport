import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#111018] text-white hover:bg-[#1E1B2B] dark:bg-[#F4F2FF] dark:text-[#14121F] dark:hover:bg-white shadow-[0_8px_20px_rgba(17,16,24,0.16)]',
  accent:
    'bg-accent text-white hover:bg-accent-hover shadow-[0_8px_22px_rgba(124,92,252,0.32)]',
  secondary:
    'bg-surface text-ink hover:bg-surface-sunken border border-line/[0.06]',
  outline:
    'border border-line/15 bg-transparent text-ink hover:bg-surface',
  ghost: 'text-ink-soft hover:bg-surface hover:text-ink',
  danger:
    'bg-[#B42318] text-white hover:bg-[#951C12] shadow-[0_8px_20px_rgba(180,35,24,0.24)]',
};

const TAILLES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-[15px]',
  icon: 'h-9 w-9 p-0',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    'inline-flex select-none items-center justify-center rounded-pill font-medium tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-shell disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97]',
    VARIANTES[variant],
    TAILLES[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {loading ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  },
);
