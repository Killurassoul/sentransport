import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  erreur?: string;
  hint?: string;
  icone?: ReactNode;
  conteneurClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    erreur,
    hint,
    icone,
    className,
    conteneurClassName,
    id,
    required,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={cn('w-full', conteneurClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] font-medium text-ink-soft"
        >
          {label}
          {required ? <span className="ml-0.5 text-accent">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {icone ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
          >
            {icone}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(erreur) || undefined}
          aria-describedby={erreur || hint ? descriptionId : undefined}
          className={cn(
            'h-11 w-full rounded-[14px] border border-line/10 bg-shell px-3.5 text-sm text-ink shadow-[inset_0_1px_2px_rgba(20,18,31,0.03)] transition-colors placeholder:text-ink-mute/80',
            'focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25',
            icone && 'pl-10',
            erreur && 'border-danger/50 focus-visible:border-danger focus-visible:ring-danger/20',
            className,
          )}
          {...props}
        />
      </div>
      {erreur ? (
        <p id={descriptionId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {erreur}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="mt-1.5 text-xs text-ink-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  erreur?: string;
  hint?: string;
  conteneurClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, erreur, hint, className, conteneurClassName, id, required, ...props },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className={conteneurClassName ?? 'w-full'}>
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[13px] font-medium text-ink-soft"
          >
            {label}
            {required ? <span className="ml-0.5 text-accent">*</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(erreur) || undefined}
          className={cn(
            'min-h-[104px] w-full resize-y rounded-[14px] border border-line/10 bg-shell px-3.5 py-3 text-sm text-ink transition-colors placeholder:text-ink-mute/80',
            'focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25',
            erreur && 'border-danger/50',
            className,
          )}
          {...props}
        />
        {erreur ? (
          <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {erreur}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-mute">{hint}</p>
        ) : null}
      </div>
    );
  },
);
