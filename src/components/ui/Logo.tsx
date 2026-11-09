import { Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function Logo({
  compact = false,
  clair = false,
  className,
}: {
  compact?: boolean;
  clair?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/dashboard"
      aria-label="SenTransport — tableau de bord"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white shadow-[0_6px_16px_rgba(124,92,252,0.35)]">
        <Truck aria-hidden className="h-[18px] w-[18px]" />
      </span>
      {compact ? null : (
        <span
          className={cn(
            'text-[15px] font-semibold tracking-[-0.02em]',
            clair ? 'text-white' : 'text-ink',
          )}
        >
          SenTransport
        </span>
      )}
    </Link>
  );
}
