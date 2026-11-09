import { cn } from '@/lib/cn';
import { initiales, teinteAvatar } from '@/lib/utils';

const TAILLES = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-lg',
};

export interface AvatarProps {
  prenom: string;
  nom: string;
  taille?: keyof typeof TAILLES;
  enLigne?: boolean;
  className?: string;
}

export function Avatar({
  prenom,
  nom,
  taille = 'md',
  enLigne = false,
  className,
}: AvatarProps) {
  const seed = `${prenom}${nom}`;
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        aria-hidden
        className={cn(
          'grid place-items-center rounded-full font-semibold tracking-wide ring-1 ring-inset ring-black/[0.04]',
          TAILLES[taille],
          teinteAvatar(seed),
        )}
      >
        {initiales(prenom, nom)}
      </span>
      {enLigne ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-shell bg-success"
          aria-label="En ligne"
        />
      ) : null}
      <span className="sr-only">
        {prenom} {nom}
      </span>
    </span>
  );
}
