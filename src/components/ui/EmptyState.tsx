import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

type Variante = 'colis' | 'recherche' | 'messages' | 'carte';

function Illustration({ variante }: { variante: Variante }) {
  const commun = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <div className="absolute inset-0 rounded-full bg-accent/[0.09]" />
      <div className="absolute inset-3 rounded-full bg-accent/[0.07]" />
      <svg
        viewBox="0 0 64 64"
        className="relative h-16 w-16 text-accent"
        aria-hidden
      >
        {variante === 'recherche' ? (
          <>
            <path d="M12 24 32 13l20 11v20L32 55 12 44Z" {...commun} />
            <path d="M12 24l20 11 20-11M32 35v20" {...commun} opacity={0.55} />
            <circle cx="42" cy="42" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="m49 49 7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </>
        ) : variante === 'messages' ? (
          <>
            <path d="M9 19h32v20H24l-9 7v-7H9Z" {...commun} />
            <path d="M27 32h28v16H44l-6 5v-5h-11Z" {...commun} opacity={0.6} />
            <path d="M17 27h16M17 32h10" {...commun} opacity={0.5} />
          </>
        ) : variante === 'carte' ? (
          <>
            <path d="M12 22l13-6 14 6 13-6v26l-13 6-14-6-13 6Z" {...commun} />
            <path d="M25 16v26M39 22v26" {...commun} opacity={0.5} />
            <path d="M32 24c3 0 5 2.2 5 5 0 4-5 9-5 9s-5-5-5-9c0-2.8 2-5 5-5Z" fill="currentColor" opacity={0.65} />
          </>
        ) : (
          <>
            <path d="M10 23 32 11l22 12v22L32 57 10 45Z" {...commun} />
            <path d="M10 23l22 12 22-12M32 35v22" {...commun} opacity={0.5} />
            <path d="M21 17l22 12v10" {...commun} opacity={0.7} />
            <path d="M40 18.5 32 23" {...commun} opacity={0.4} />
          </>
        )}
      </svg>
    </div>
  );
}

export function EmptyState({
  titre,
  texte,
  action,
  variante = 'colis',
  className,
}: {
  titre: string;
  texte: string;
  action?: ReactNode;
  variante?: Variante;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      <Illustration variante={variante} />
      <h3 className="mt-4 text-base font-semibold text-ink">{titre}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{texte}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  compact = false,
  className,
}: {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-danger/15 bg-danger/[0.04] px-6 text-center',
        compact ? 'py-6' : 'py-10',
        className,
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="mt-3 max-w-md text-sm font-medium text-ink">{message}</p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
          iconLeft={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Réessayer
        </Button>
      ) : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent/25 border-t-accent',
        className,
      )}
    />
  );
}
