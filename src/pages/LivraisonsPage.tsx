import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Columns3, List } from 'lucide-react';
import type { Colis } from '@/api/types';
import { useLivraisons } from '@/api/hooks/livraisons';
import { useColisList } from '@/api/hooks/colis';
import { useUtilisateurs } from '@/api/hooks/users';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatutBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { SkeletonTableau } from '@/components/ui/Skeleton';
import { Kanban } from '@/features/livraisons/Kanban';
import { codeVille } from '@/lib/constants';
import { dateCourte } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';

export function LivraisonsPage() {
  const { t, langue } = useI18n();
  const { data: livraisons, isLoading, isError, error, refetch } = useLivraisons();
  const { data: colisPage } = useColisList({ limit: 200 });
  const { data: livreurs } = useUtilisateurs('livreur');
  const [vue, setVue] = useState<'liste' | 'kanban'>('liste');

  const colisParNumero = useMemo(() => {
    const map = new Map<string, Colis>();
    colisPage?.items.forEach((c) => map.set(c.numeroSuivi, c));
    return map;
  }, [colisPage]);

  const liste = livraisons ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-mute">
          <span className="rounded-pill bg-surface px-2.5 py-1 font-medium">
            <span className="num font-semibold text-ink">{liste.length}</span> affectations
          </span>
          <span className="rounded-pill bg-surface px-2.5 py-1 font-medium">
            <span className="num font-semibold text-ink">
              {liste.filter((l) => l.statut === 'en_transit').length}
            </span>{' '}
            en cours
          </span>
          <span className="rounded-pill bg-surface px-2.5 py-1 font-medium">
            <span className="num font-semibold text-ink">
              {liste.filter((l) => l.statut === 'livre').length}
            </span>{' '}
            livrées
          </span>
        </div>
        <SegmentedControl
          ariaLabel="Mode d’affichage des livraisons"
          value={vue}
          onChange={setVue}
          options={[
            { value: 'liste', label: t('livraisons.vue.liste'), icone: <List className="h-3 w-3" /> },
            {
              value: 'kanban',
              label: t('livraisons.vue.kanban'),
              icone: <Columns3 className="h-3 w-3" />,
            },
          ]}
        />
      </div>

      {isLoading ? (
        <SkeletonTableau lignes={6} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : t('commun.erreur_reseau')}
          onRetry={() => void refetch()}
          className="bg-shell"
        />
      ) : liste.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            titre={t('livraisons.vide')}
            texte="Affectez un colis depuis l’administration pour créer une livraison."
            variante="colis"
          />
        </div>
      ) : vue === 'kanban' ? (
        <div className="surface-card overflow-hidden">
          <Kanban
            livraisons={liste}
            colisParNumero={colisParNumero}
            livreurs={livreurs ?? []}
          />
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">Livraisons et affectations</caption>
              <thead>
                <tr className="border-b border-line/[0.07] text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute">
                  <th scope="col" className="px-4 py-3">
                    {t('livraisons.colonnes.colis')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('livraisons.colonnes.livreur')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('livraisons.colonnes.tournee')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('livraisons.colonnes.statut')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t('livraisons.colonnes.affecte')}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    <span className="sr-only">{t('commun.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {liste.map((livraison) => {
                  const colis = colisParNumero.get(livraison.numeroSuivi);
                  const livreur = livreurs?.find((l) => l.id === livraison.livreurId);
                  return (
                    <tr
                      key={livraison.id}
                      className="border-b border-line/[0.05] transition-colors last:border-0 hover:bg-surface/70"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/colis/${livraison.numeroSuivi}`}
                          className="num text-[12.5px] font-semibold text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          {livraison.numeroSuivi}
                        </Link>
                        {colis ? (
                          <p className="mt-0.5 text-[10.5px] text-ink-mute">
                            {codeVille(colis.villeDepart)} → {codeVille(colis.villeArrivee)} ·{' '}
                            {colis.destinataire.nom}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        {livreur ? (
                          <div className="flex items-center gap-2">
                            <Avatar prenom={livreur.prenom} nom={livreur.nom} taille="xs" />
                            <div>
                              <p className="text-[11.5px] font-medium text-ink">
                                {livreur.prenom} {livreur.nom}
                              </p>
                              <p className="text-[10px] text-ink-mute">{livreur.ville}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-mute">Non affecté</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-pill bg-surface px-2.5 py-1 text-[10.5px] font-medium text-ink-soft">
                          {livraison.tournee}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <StatutBadge statut={livraison.statut} taille="sm" />
                        {livraison.motifEchec ? (
                          <p className="mt-1 max-w-[180px] text-[10px] text-danger">
                            {livraison.motifEchec}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-[11px] text-ink-soft">
                        {dateCourte(livraison.dateAffectation, langue)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/colis/${livraison.numeroSuivi}`}
                          aria-label={`${t('commun.voir')} ${livraison.numeroSuivi}`}
                          className="inline-grid h-7 w-7 place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
