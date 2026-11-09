import { cn } from '@/lib/cn';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-xl bg-line/[0.07] dark:bg-white/[0.06]',
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonTexte({
  lignes = 3,
  className,
}: {
  lignes?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lignes }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3', index === lignes - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCarte({ className }: { className?: string }) {
  return (
    <div className={cn('surface-card p-5', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <Skeleton className="mt-5 h-24 w-full rounded-2xl" />
    </div>
  );
}

export function SkeletonTableau({
  lignes = 6,
  colonnes = 5,
}: {
  lignes?: number;
  colonnes?: number;
}) {
  return (
    <div className="surface-card overflow-hidden" aria-busy="true" aria-label="Chargement">
      <div className="border-b border-line/[0.06] px-5 py-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-line/[0.05]">
        {Array.from({ length: lignes }).map((_, ligne) => (
          <div key={ligne} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-4 w-4 rounded" />
            {Array.from({ length: colonnes }).map((__, colonne) => (
              <Skeleton
                key={colonne}
                className={cn(
                  'h-3.5',
                  colonne === 0 ? 'w-32' : colonne === colonnes - 1 ? 'w-16' : 'w-24',
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
