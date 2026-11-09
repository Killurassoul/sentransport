import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/hooks/useI18n';

function pagesVisibles(page: number, total: number): (number | '…')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, page, page - 1, page + 1]);
  const triees = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultat: (number | '…')[] = [];
  triees.forEach((p, index) => {
    if (index > 0 && p - (triees[index - 1] as number) > 1) resultat.push('…');
    resultat.push(p);
  });
  return resultat;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  const { t } = useI18n();
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center gap-1.5', className)}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label={t('commun.precedent')}
        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pagesVisibles(page, pageCount).map((p, index) =>
        p === '…' ? (
          <span key={`ellipse-${index}`} className="px-1 text-xs text-ink-mute">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'num h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              p === page
                ? 'bg-[#111018] text-white dark:bg-[#F4F2FF] dark:text-[#14121F]'
                : 'text-ink-soft hover:bg-surface hover:text-ink',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        aria-label={t('commun.suivant')}
        className="grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
