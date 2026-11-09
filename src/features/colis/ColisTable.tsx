import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown } from 'lucide-react';
import type { Colis, ColisListParams } from '@/api/types';
import { StatutBadge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Avatar } from '@/components/ui/Avatar';
import { codeVille } from '@/lib/constants';
import { dateCourte, nombre } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/cn';

export type TriColis = NonNullable<ColisListParams['tri']>;

interface ColisTableProps {
  colis: Colis[];
  selection: Set<string>;
  onBasculer: (id: string) => void;
  onBasculerTout: () => void;
  tri: TriColis;
  onTri: (tri: TriColis) => void;
}

function EnteteTriable({
  libelle,
  actif,
  direction,
  onClick,
  className,
}: {
  libelle: string;
  actif: boolean;
  direction: 'asc' | 'desc';
  onClick: () => void;
  className?: string;
}) {
  return (
    <th
      scope="col"
      aria-sort={actif ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('px-3 py-3 text-left', className)}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {libelle}
        {actif ? (
          direction === 'asc' ? (
            <ArrowUp aria-hidden className="h-3 w-3" />
          ) : (
            <ArrowDown aria-hidden className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown aria-hidden className="h-3 w-3 opacity-50" />
        )}
      </button>
    </th>
  );
}

export function ColisTable({
  colis,
  selection,
  onBasculer,
  onBasculerTout,
  tri,
  onTri,
}: ColisTableProps) {
  const { t, langue } = useI18n();
  const refTout = useRef<HTMLInputElement>(null);
  const tousSelectionnes = colis.length > 0 && colis.every((c) => selection.has(c.id));
  const partiel = selection.size > 0 && !tousSelectionnes;

  useEffect(() => {
    if (refTout.current) refTout.current.indeterminate = partiel;
  }, [partiel]);

  const basculerTri = (nouveau: TriColis) => {
    onTri(nouveau);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">
          Liste des colis : numéro, destinataire, trajet, statut, poids et date
        </caption>
        <thead>
          <tr className="border-b border-line/[0.07]">
            <th scope="col" className="w-10 pl-4 pr-1">
              <Checkbox
                ref={refTout}
                checked={tousSelectionnes}
                onChange={onBasculerTout}
                aria-label="Sélectionner tous les colis de la page"
              />
            </th>
            <EnteteTriable
              libelle={t('colis.colonnes.numero')}
              actif={tri === 'numero'}
              direction="asc"
              onClick={() => basculerTri('numero')}
            />
            <th
              scope="col"
              className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute"
            >
              {t('colis.colonnes.destinataire')}
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute"
            >
              {t('colis.colonnes.trajet')}
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute"
            >
              {t('colis.colonnes.statut')}
            </th>
            <EnteteTriable
              libelle={t('colis.colonnes.poids')}
              actif={tri === 'poids'}
              direction="desc"
              onClick={() => basculerTri('poids')}
            />
            <EnteteTriable
              libelle={t('colis.colonnes.date')}
              actif={tri === 'recent' || tri === 'ancien'}
              direction={tri === 'ancien' ? 'asc' : 'desc'}
              onClick={() => basculerTri(tri === 'recent' ? 'ancien' : 'recent')}
            />
            <th scope="col" className="px-3 py-3">
              <span className="sr-only">{t('commun.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {colis.map((c) => {
            const selectionne = selection.has(c.id);
            return (
              <tr
                key={c.id}
                className={cn(
                  'group border-b border-line/[0.05] transition-colors last:border-0',
                  selectionne ? 'bg-accent/[0.05]' : 'hover:bg-surface/70',
                )}
              >
                <td className="pl-4 pr-1">
                  <Checkbox
                    checked={selectionne}
                    onChange={() => onBasculer(c.id)}
                    aria-label={`Sélectionner ${c.numeroSuivi}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/colis/${c.numeroSuivi}`}
                    className="num text-[12.5px] font-semibold text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {c.numeroSuivi}
                  </Link>
                  <p className="mt-0.5 truncate text-[10.5px] text-ink-mute">
                    {c.description}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      prenom={c.destinataire.nom.split(' ')[0] ?? ''}
                      nom={c.destinataire.nom.split(' ')[1] ?? ''}
                      taille="xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-ink">
                        {c.destinataire.nom}
                      </p>
                      <p className="truncate text-[10.5px] text-ink-mute">
                        {c.destinataire.ville}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="num inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
                    {codeVille(c.villeDepart)}
                    <span aria-hidden className="text-ink-mute">→</span>
                    {codeVille(c.villeArrivee)}
                  </span>
                  <p className="num mt-0.5 text-[10.5px] text-ink-mute">
                    {nombre(c.distanceKm, langue)} km
                  </p>
                </td>
                <td className="px-3 py-3">
                  <StatutBadge statut={c.statut} taille="sm" />
                </td>
                <td className="px-3 py-3">
                  <span className="num text-[12px] font-medium text-ink">
                    {nombre(c.poidsKg, langue, 1)} <span className="text-[10px] text-ink-mute">kg</span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-[11.5px] text-ink-soft">
                    {dateCourte(c.dateCreation, langue)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    to={`/colis/${c.numeroSuivi}`}
                    aria-label={`${t('commun.voir')} ${c.numeroSuivi}`}
                    className="inline-grid h-7 w-7 place-items-center rounded-full text-ink-mute transition-colors hover:bg-shell hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
  );
}
