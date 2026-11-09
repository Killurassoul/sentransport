import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'white' | 'plain';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const VARIANTES = {
  surface: 'surface-card',
  white: 'white-card',
  plain: 'rounded-card border border-line/[0.05] bg-shell',
};

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = 'surface', padding = 'md', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(VARIANTES[variant], PADDINGS[padding], className)}
      {...props}
    />
  );
});

interface SectionCardProps
  extends Omit<HTMLMotionProps<'section'>, 'title'> {
  titre: ReactNode;
  action?: ReactNode;
  sousTitre?: ReactNode;
  icone?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'surface' | 'white';
}

/** Carte de section : en-tête discret, contenu, action à droite. */
export function SectionCard({
  titre,
  sousTitre,
  action,
  icone,
  children,
  className,
  contentClassName,
  padding = 'md',
  variant = 'surface',
  ...props
}: SectionCardProps) {
  return (
    <motion.section
      className={cn(
        'flex flex-col overflow-hidden',
        variant === 'surface' ? 'surface-card' : 'white-card',
        className,
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-2.5">
          {icone ? (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink-soft">
              {icone}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-ink">{titre}</h2>
            {sousTitre ? (
              <p className="mt-0.5 truncate text-xs text-ink-mute">{sousTitre}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div
        className={cn(
          'min-h-0 flex-1',
          PADDINGS[padding === 'none' ? 'none' : padding],
          padding !== 'none' && 'pt-4',
          contentClassName,
        )}
      >
        {children}
      </div>
    </motion.section>
  );
}
