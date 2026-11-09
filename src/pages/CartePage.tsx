import { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import type { StatutColis } from '@/api/types';
import { useColisList } from '@/api/hooks/colis';
import { MapReseau } from '@/features/carte/MapReseau';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useI18n } from '@/hooks/useI18n';
import { STATUTS } from '@/lib/constants';
import { cn } from '@/lib/cn';

const FILTRES: (StatutColis | 'tous')[] = [
  'tous',
  'en_attente',
  'pris_en_charge',
  'en_transit',
];

const ACTIFS: StatutColis[] = ['en_attente', 'pris_en_charge', 'en_transit'];

export function CartePage() {
  const { t } = useI18n();
  const { data, isLoading, isError, error, refetch } = useColisList({ limit: 200 });
  const [filtre, setFiltre] = useState<StatutColis | 'tous'>('tous');

  const actifs = useMemo(
    () => (data?.items ?? []).filter((c) => ACTIFS.includes(c.statut)),
    [data],
  );

  const filtres = useMemo(
    () => (filtre === 'tous' ? actifs : actifs.filter((c) => c.statut === filtre)),
    [actifs, filtre],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={t('carte.filtre')}
          className="no-scrollbar flex items-center gap-1 overflow-x-auto"
        >
          {FILTRES.map((statut) => {
            const actif = statut === filtre;
            return (
              <button
                key={statut}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => setFiltre(statut)}
                className={cn(
                  'shrink-0 rounded-pill px-3 py-1.5 text-[11.5px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  actif
                    ? 'bg-[#111018] text-white dark:bg-[#F4F2FF] dark:text-[#14121F]'
                    : 'bg-surface text-ink-soft hover:bg-surface-sunken',
                )}
              >
                {t(statut === 'tous' ? 'statut.tous' : `statut.${statut}`)}
              </button>
            );
          })}
          <span className="ml-1 shrink-0 rounded-pill bg-surface px-2.5 py-1 text-[10.5px] font-medium text-ink-mute">
            <span className="num font-semibold text-ink">{filtres.length}</span>{' '}
            {t('carte.actifs')}
          </span>
        </div>
        <div className="hidden items-center gap-2 text-[10.5px] text-ink-mute sm:flex">
          <Layers aria-hidden className="h-3.5 w-3.5" />
          Regroupement par ville d’arrivée
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[calc(100dvh-250px)] min-h-[480px] rounded-card" />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : t('commun.erreur_reseau')}
          onRetry={() => void refetch()}
          className="min-h-[400px] bg-shell"
        />
      ) : filtres.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            titre={t('carte.vide')}
            texte="Changez de filtre ou créez un colis pour le voir apparaître ici."
            variante="carte"
          />
        </div>
      ) : (
        <div className="relative surface-card overflow-hidden p-2">
          <div className="h-[calc(100dvh-250px)] min-h-[480px]">
            <MapReseau colis={filtres} />
          </div>

          <div className="pointer-events-none absolute bottom-6 left-6 z-[500] rounded-[14px] border border-line/10 bg-shell/95 px-3.5 py-3 shadow-card backdrop-blur">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-mute">
              {t('carte.legende')}
            </p>
            <ul className="space-y-1.5">
              {(['en_attente', 'pris_en_charge', 'en_transit'] as StatutColis[]).map(
                (statut) => (
                  <li key={statut} className="flex items-center gap-2 text-[10.5px] text-ink-soft">
                    <span
                      aria-hidden
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        STATUTS[statut].ton === 'warning' && 'bg-warning',
                        STATUTS[statut].ton === 'info' && 'bg-info',
                        STATUTS[statut].ton === 'accent' && 'bg-accent',
                      )}
                    />
                    {t(`statut.${statut}`)}
                    <span className="num ml-auto font-semibold text-ink">
                      {actifs.filter((c) => c.statut === statut).length}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
