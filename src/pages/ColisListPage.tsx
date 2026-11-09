import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  Table2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Colis } from '@/api/types';
import { api, normaliserErreur } from '@/api/client';
import { useColisList } from '@/api/hooks/colis';
import { ColisTable, type TriColis } from '@/features/colis/ColisTable';
import { ColisCards } from '@/features/colis/ColisCards';
import { FiltresStatut } from '@/features/colis/FiltresStatut';
import { Input } from '@/components/ui/Input';
import { Button, buttonVariants } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { SkeletonTableau } from '@/components/ui/Skeleton';
import { useI18n } from '@/hooks/useI18n';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/store/auth';
import { exporterColis } from '@/lib/csv';
import type { FiltreStatut } from '@/lib/constants';
import type { Paginated } from '@/api/types';

const LIMITE = 8;

export function ColisListPage() {
  const { t } = useI18n();
  const role = useAuthStore((s) => s.utilisateur?.role);
  const estMobile = useMediaQuery('(max-width: 767px)');
  const [recherche, setRecherche] = useState('');
  const [q, setQ] = useState('');
  const [statut, setStatut] = useState<FiltreStatut>('tous');
  const [tri, setTri] = useState<TriColis>('recent');
  const [page, setPage] = useState(1);
  const [vue, setVue] = useState<'tableau' | 'cartes'>('tableau');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [exportEnCours, setExportEnCours] = useState(false);

  const parametres = useMemo(
    () => ({ q, statut, tri, page, limit: LIMITE }),
    [q, statut, tri, page],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useColisList(parametres);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(recherche.trim());
      setPage(1);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [recherche]);

  useEffect(() => {
    setPage(1);
  }, [statut, tri]);

  useEffect(() => {
    setSelection(new Set());
  }, [q, statut, page]);

  const items = data?.items ?? [];
  const vueEffective = estMobile ? 'cartes' : vue;

  const basculer = (id: string) => {
    setSelection((precedente) => {
      const suivante = new Set(precedente);
      if (suivante.has(id)) suivante.delete(id);
      else suivante.add(id);
      return suivante;
    });
  };

  const basculerTout = () => {
    setSelection((precedente) => {
      const tous = items.length > 0 && items.every((c) => precedente.has(c.id));
      return tous ? new Set() : new Set(items.map((c) => c.id));
    });
  };

  const exporter = async () => {
    setExportEnCours(true);
    try {
      const { data: complet } = await api.get<Paginated<Colis>>('/colis', {
        params: { q, statut, tri, limit: 200 },
      });
      const liste =
        selection.size > 0
          ? complet.items.filter((c) => selection.has(c.id))
          : complet.items;
      if (liste.length === 0) {
        toast.info(t('colis.filtre_vide.titre'));
        return;
      }
      exporterColis(liste);
      toast.success(
        `${liste.length} colis exportés`,
        { description: 'Fichier CSV prêt pour Excel (séparateur point-virgule).' },
      );
    } catch (erreur) {
      toast.error(normaliserErreur(erreur).message);
    } finally {
      setExportEnCours(false);
    }
  };

  const filtresActifs = q !== '' || statut !== 'tous';

  return (
    <div className="flex flex-col gap-4">
      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line/[0.06] p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              placeholder={t('colis.recherche')}
              aria-label={t('commun.rechercher')}
              icone={<Search className="h-4 w-4" />}
              conteneurClassName="sm:max-w-[290px]"
              className="h-9 rounded-pill bg-shell text-[12px]"
            />
            <FiltresStatut
              valeur={statut}
              onChange={(valeur) => setStatut(valeur)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <label className="sr-only" htmlFor="tri-colis">
              Trier
            </label>
            <select
              id="tri-colis"
              value={tri}
              onChange={(evenement) => setTri(evenement.target.value as TriColis)}
              className="h-9 rounded-pill border border-line/[0.08] bg-shell px-3 text-[11.5px] font-medium text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:bg-white/[0.04]"
            >
              <option value="recent">Plus récents</option>
              <option value="ancien">Plus anciens</option>
              <option value="poids">Poids décroissant</option>
              <option value="numero">Numéro de suivi</option>
            </select>

            <div className="hidden md:block">
              <SegmentedControl
                ariaLabel="Mode d’affichage"
                value={vue}
                onChange={setVue}
                options={[
                  {
                    value: 'tableau',
                    label: t('colis.vue_tableau'),
                    icone: <Table2 className="h-3 w-3" aria-hidden />,
                  },
                  {
                    value: 'cartes',
                    label: t('colis.vue_cartes'),
                    icone: <LayoutGrid className="h-3 w-3" aria-hidden />,
                  },
                ]}
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => void exporter()}
              loading={exportEnCours}
              iconLeft={<Download className="h-3.5 w-3.5" />}
              className="h-9"
            >
              <span className="hidden sm:inline">
                {selection.size > 0 ? `${selection.size} ` : ''}
                {t('colis.export')}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-[11px] text-ink-mute">
          <span>
            {data ? (
              <>
                <span className="num font-semibold text-ink">{data.total}</span>{' '}
                {t('colis.titre').toLowerCase()}
                {isFetching && !isLoading ? (
                  <Loader2
                    aria-label={t('commun.chargement')}
                    className="ml-2 inline h-3 w-3 animate-spin"
                  />
                ) : null}
              </>
            ) : (
              t('commun.chargement')
            )}
          </span>
          {filtresActifs ? (
            <button
              type="button"
              onClick={() => {
                setRecherche('');
                setQ('');
                setStatut('tous');
              }}
              className="inline-flex items-center gap-1 rounded-pill px-2 py-1 text-[10.5px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-3 w-3" />
              Réinitialiser
            </button>
          ) : null}
        </div>

        {selection.size > 0 ? (
          <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-accent-soft px-3 py-2">
            <p className="text-[11.5px] font-semibold text-accent-deep">
              {t('colis.selection', { n: selection.size })}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelection(new Set())}
                className="rounded-pill px-2 py-1 text-[10.5px] font-medium text-accent-deep/80 transition-colors hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Tout désélectionner
              </button>
              <button
                type="button"
                onClick={() => void exporter()}
                className="inline-flex items-center gap-1 rounded-pill bg-shell px-2.5 py-1 text-[10.5px] font-semibold text-accent-deep transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Download className="h-3 w-3" />
                {t('colis.export')}
              </button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-4">
            <SkeletonTableau lignes={LIMITE} />
          </div>
        ) : isError ? (
          <div className="p-4">
            <ErrorState
              message={error instanceof Error ? error.message : t('commun.erreur_reseau')}
              onRetry={() => void refetch()}
            />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            titre={
              filtresActifs ? t('colis.filtre_vide.titre') : t('colis.vide.titre')
            }
            texte={
              filtresActifs ? t('colis.filtre_vide.texte') : t('colis.vide.texte')
            }
            variante={filtresActifs ? 'recherche' : 'colis'}
            action={
              filtresActifs ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setRecherche('');
                    setQ('');
                    setStatut('tous');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              ) : role !== 'livreur' ? (
                <Link to="/colis/nouveau" className={buttonVariants({ variant: 'accent', size: 'sm' })}>
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  {t('colis.nouveau')}
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            {vueEffective === 'tableau' ? (
              <ColisTable
                colis={items}
                selection={selection}
                onBasculer={basculer}
                onBasculerTout={basculerTout}
                tri={tri}
                onTri={setTri}
              />
            ) : (
              <ColisCards colis={items} />
            )}
          </>
        )}

        {data && data.total > 0 ? (
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line/[0.06] px-4 py-3">
            <p className="text-[10.5px] text-ink-mute">
              {t('colis.page', { page: data.page, total: data.pageCount })}
            </p>
            <Pagination page={data.page} pageCount={data.pageCount} onChange={setPage} />
          </footer>
        ) : null}
      </div>
    </div>
  );
}
