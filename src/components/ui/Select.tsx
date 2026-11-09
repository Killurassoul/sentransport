import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface OptionSelect {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  erreur?: string;
  options: OptionSelect[];
  placeholder?: string;
  conteneurClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    erreur,
    options,
    placeholder,
    className,
    conteneurClassName,
    id,
    required,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn('w-full', conteneurClassName)}>
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-[13px] font-medium text-ink-soft"
        >
          {label}
          {required ? <span className="ml-0.5 text-accent">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(erreur) || undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-[14px] border border-line/10 bg-shell pl-3.5 pr-10 text-sm text-ink transition-colors',
            'focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25',
            erreur && 'border-danger/50',
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
        />
      </div>
      {erreur ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {erreur}
        </p>
      ) : null}
    </div>
  );
});
