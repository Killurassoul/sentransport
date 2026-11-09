import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { StatutColis } from '@/api/types';
import { STATUTS } from '@/lib/constants';
import { useI18n } from '@/hooks/useI18n';

export type BadgeTon =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'dark';

const TONS: Record<BadgeTon, string> = {
  neutral: 'bg-surface-sunken text-ink-soft',
  accent: 'bg-accent-soft text-accent-deep',
  success: 'bg-[#E7F7ED] text-[#15803D] dark:bg-success/15 dark:text-[#86EFAC]',
  warning: 'bg-[#FDF3E2] text-[#8A5A08] dark:bg-warning/15 dark:text-[#FBBF24]',
  danger: 'bg-[#FDECEC] text-[#B42318] dark:bg-danger/15 dark:text-[#FCA5A5]',
  info: 'bg-[#EAF1FE] text-[#1E4FA8] dark:bg-info/15 dark:text-[#93C5FD]',
  dark: 'bg-[#111018] text-white dark:bg-[#F4F2FF] dark:text-[#14121F]',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  ton?: BadgeTon;
  point?: boolean;
  taille?: 'sm' | 'md';
  children: ReactNode;
}

export function Badge({
  ton = 'neutral',
  point = false,
  taille = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill font-medium whitespace-nowrap',
        taille === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        TONS[ton],
        className,
      )}
      {...props}
    >
      {point ? (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}

export function StatutBadge({
  statut,
  taille = 'md',
  className,
}: {
  statut: StatutColis;
  taille?: 'sm' | 'md';
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <Badge ton={STATUTS[statut].ton} point taille={taille} className={className}>
      {t(`statut.${statut}`)}
    </Badge>
  );
}
