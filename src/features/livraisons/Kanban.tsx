import { Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import type { Colis, Livraison, StatutLivraison, Utilisateur } from '@/api/types';
import { StatutBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { codeVille } from '@/lib/constants';
import { dateCourte } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/cn';

const COLONNES: { statut: StatutLivraison; couleur: string }[] = [
  { statut: 'en_attente', couleur: 'bg-warning' },
  { statut: 'en_transit', couleur: 'bg-accent' },
  { statut: 'livre', couleur: 'bg-success' },
  { statut: 'echec', couleur: 'bg-danger' },
];

export function Kanban({
  livraisons,
  colisParNumero,
  livreurs,
}: {
  livraisons: Livraison[];
  colisParNumero: Map<string, Colis>;
  livreurs: Utilisateur[];
}) {
  const { t, langue } = useI18n();

  if (livraisons.length === 0) {
    return (
      <EmptyState
        titre={t('livraisons.vide')}
        texte="Les affectations apparaîtront ici dès qu’un colis sera confié à un livreur."
        variante="carte"
      />
    );
  }

  return (
    <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">
      {COLONNES.map(({ statut, couleur }) => {
        const elements = livraisons.filter((l) => l.statut === statut);
        return (
          <section
            key={statut}
            aria-label={t(`statut.${statut}`)}
            className="flex flex-col gap-2 rounded-[16px] bg-shell/50 p-2.5 dark:bg-white/[0.02]"
          >
            <header className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-2">
                <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', couleur)} />
                <h3 className="text-[11.5px] font-semibold text-ink">
                  {t(`statut.${statut}`)}
                </h3>
              </div>
              <span className="num rounded-pill bg-surface px-2 py-0.5 text-[9.5px] font-semibold text-ink-soft">
                {elements.length}
              </span>
            </header>

            <ul className="flex flex-col gap-2">
              {elements.map((livraison) => {
                const colis = colisParNumero.get(livraison.numeroSuivi);
                const livreur = livreurs.find((l) => l.id === livraison.livreurId);
                return (
                  <li key={livraison.id}>
                    <Link
                      to={`/colis/${livraison.numeroSuivi}`}
                      className="group block rounded-[14px] border border-line/[0.06] bg-shell p-3 shadow-[0_2px_8px_rgba(20,18,31,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="num text-[11.5px] font-semibold text-ink">
                          {livraison.numeroSuivi}
                        </p>
                        <ChevronRight
                          aria-hidden
                          className="h-3.5 w-3.5 text-ink-mute transition-transform group-hover:translate-x-0.5"
                        />
                      </div>

                      {colis ? (
                        <>
                          <p className="mt-1.5 truncate text-[11px] font-medium text-ink-soft">
                            {colis.destinataire.nom}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-mute">
                            <MapPin aria-hidden className="h-2.5 w-2.5" />
                            {codeVille(colis.villeDepart)} → {codeVille(colis.villeArrivee)}
                          </p>
                        </>
                      ) : null}

                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/[0.06] pt-2">
                        {livreur ? (
                          <span className="flex items-center gap-1.5">
                            <Avatar
                              prenom={livreur.prenom}
                              nom={livreur.nom}
                              taille="xs"
                            />
                            <span className="truncate text-[9.5px] font-medium text-ink-soft">
                              {livreur.prenom}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-ink-mute">—</span>
                        )}
                        <span className="text-[9px] text-ink-mute">
                          {dateCourte(livraison.dateAffectation, langue)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <StatutBadge statut={livraison.statut} taille="sm" />
                      </div>
                    </Link>
                  </li>
                );
              })}
              {elements.length === 0 ? (
                <li className="px-2 py-6 text-center text-[10.5px] text-ink-mute">
                  Aucune course
                </li>
              ) : null}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
