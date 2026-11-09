import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface OptionSegmentee<T extends string> {
  value: T;
  label: string;
  icone?: React.ReactNode;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  taille = 'md',
  className,
}: {
  value: T;
  onChange: (valeur: T) => void;
  options: OptionSegmentee<T>[];
  ariaLabel: string;
  taille?: 'sm' | 'md';
  className?: string;
}) {
  const id = useId();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill border border-line/[0.06] bg-surface p-1',
        className,
      )}
    >
      {options.map((option) => {
        const actif = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={actif}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 inline-flex items-center gap-1.5 rounded-pill font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              taille === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-8 px-3 text-xs',
              actif ? 'text-ink' : 'text-ink-mute hover:text-ink-soft',
            )}
          >
            {actif ? (
              <motion.span
                layoutId={`segmented-${id}`}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-pill bg-shell shadow-[0_2px_8px_rgba(20,18,31,0.08)]"
              />
            ) : null}
            {option.icone}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
