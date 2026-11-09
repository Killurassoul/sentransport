import { useCountUp } from '@/hooks/useCountUp';
import { nombre } from '@/lib/format';
import { cn } from '@/lib/cn';

export function Counter({
  valeur,
  decimales = 0,
  suffixe,
  prefixe,
  langue = 'fr',
  className,
}: {
  valeur: number;
  decimales?: number;
  suffixe?: string;
  prefixe?: string;
  langue?: string;
  className?: string;
}) {
  const affiche = useCountUp(valeur, decimales);
  const texte = nombre(affiche, langue, decimales);
  return (
    <span className={cn('num tabular-nums', className)}>
      {prefixe}
      <span aria-hidden>{texte}</span>
      <span className="sr-only">{nombre(valeur, langue, decimales)}</span>
      {suffixe ? <span className="text-ink-mute">{suffixe}</span> : null}
    </span>
  );
}
