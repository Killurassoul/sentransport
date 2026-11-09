import type { FiltreStatut } from '@/lib/constants';
import { FILTRES_STATUT } from '@/lib/constants';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/cn';

export function FiltresStatut({
  valeur,
  onChange,
}: {
  valeur: FiltreStatut;
  onChange: (valeur: FiltreStatut) => void;
}) {
  const { t } = useI18n();
  return (
    <div
      role="tablist"
      aria-label={t('commun.filtrer')}
      className="no-scrollbar flex items-center gap-1 overflow-x-auto"
    >
      {FILTRES_STATUT.map((statut) => {
        const actif = statut === valeur;
        return (
          <button
            key={statut}
            type="button"
            role="tab"
            aria-selected={actif}
            onClick={() => onChange(statut)}
            className={cn(
              'shrink-0 rounded-pill px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              actif
                ? 'bg-[#111018] text-white shadow-[0_4px_12px_rgba(17,16,24,0.18)] dark:bg-[#F4F2FF] dark:text-[#14121F]'
                : 'text-ink-soft hover:bg-surface-sunken',
            )}
          >
            {t(statut === 'tous' ? 'statut.tous' : `statut.${statut}`)}
          </button>
        );
      })}
    </div>
  );
}
