import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bike,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Package,
  Truck,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Colis, Livraison, StatutLivraison } from '@/api/types';
import { useLivraisons, useMajStatutLivraison } from '@/api/hooks/livraisons';
import { useColisList } from '@/api/hooks/colis';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { StatutBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { SkeletonTableau } from '@/components/ui/Skeleton';
import { MapOverview } from '@/components/dashboard/MapOverview';
import { heure } from '@/lib/format';
import { normaliserErreur } from '@/api/client';
import { cn } from '@/lib/cn';

export function LivreurPage() {
  const { t, langue } = useI18n();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const ajouterNotification = useUIStore((s) => s.ajouterNotification);
  const {
    data: livraisons,
    isLoading,
    isError,
    error,
    refetch,
  } = useLivraisons(utilisateur?.id);
  const { data: colisPage } = useColisList({ limit: 200 });
  const mutation = useMajStatutLivraison();
  const [echecCible, setEchecCible] = useState<Livraison | null>(null);
  const [motif, setMotif] = useState('');
  const [erreurMotif, setErreurMotif] = useState('');

  const colisParNumero = useMemo(() => {
    const map = new Map<string, Colis>();
    colisPage?.items.forEach((c) => map.set(c.numeroSuivi, c));
    return map;
  }, [colisPage]);

  const liste = useMemo(() => livraisons ?? [], [livraisons]);

  const tournees = useMemo(() => {
    const map = new Map<string, Livraison[]>();
    liste.forEach((livraison) => {
      const groupe = map.get(livraison.tournee) ?? [];
      groupe.push(livraison);
      map.set(livraison.tournee, groupe);
    });
    return [...map.entries()];
  }, [liste]);

  const stats = {
    total: liste.length,
    actives: liste.filter((l) => l.statut === 'en_attente' || l.statut === 'en_transit')
      .length,
    livrees: liste.filter((l) => l.statut === 'livre').length,
    echecs: liste.filter((l) => l.statut === 'echec').length,
  };

  const colisCarte = useMemo(() => {
    const enTransit = liste.find((l) => l.statut === 'en_transit');
    const cible = enTransit ?? liste.find((l) => l.statut === 'en_attente') ?? liste[0];
    return cible ? colisParNumero.get(cible.numeroSuivi) : undefined;
  }, [liste, colisParNumero]);

  const changerStatut = async (
    livraison: Livraison,
    statut: StatutLivraison,
    motifEchec?: string,
  ) => {
    try {
      await mutation.mutateAsync({
        id: livraison.id,
        payload: { statut, motifEchec },
      });
      toast.success(t('livreur.maj'), {
        description: `${livraison.numeroSuivi} · ${t(`statut.${statut}`)}`,
      });
      ajouterNotification({
        titre: `Statut mis à jour — ${livraison.numeroSuivi}`,
        texte: `La course est désormais « ${t(`statut.${statut}`)} ».`,
        ton: statut === 'livre' ? 'success' : statut === 'echec' ? 'warning' : 'accent',
        href: `/colis/${livraison.numeroSuivi}`,
      });
      if (statut === 'echec') {
        setEchecCible(null);
        setMotif('');
        setErreurMotif('');
      }
    } catch (erreur) {
      toast.error(normaliserErreur(erreur).message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[88px] animate-pulse rounded-card bg-line/[0.06]" />
          ))}
        </div>
        <SkeletonTableau lignes={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : t('commun.erreur_reseau')}
        onRetry={() => void refetch()}
        className="min-h-[320px] bg-shell"
      />
    );
  }

  if (liste.length === 0) {
    return (
      <div className="surface-card">
        <EmptyState
          titre="Aucune tournée pour aujourd’hui"
          texte="Les colis qui vous seront affectés apparaîtront ici avec les actions de statut."
          variante="carte"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            libelle: 'Courses du jour',
            valeur: stats.total,
            Icone: Package,
            ton: 'text-accent',
          },
          {
            libelle: 'À traiter',
            valeur: stats.actives,
            Icone: Truck,
            ton: 'text-[#8A5A08] dark:text-[#FBBF24]',
          },
          {
            libelle: 'Livrées',
            valeur: stats.livrees,
            Icone: CheckCircle2,
            ton: 'text-[#15803D] dark:text-[#86EFAC]',
          },
          {
            libelle: 'Échecs',
            valeur: stats.echecs,
            Icone: TriangleAlert,
            ton: 'text-danger',
          },
        ].map(({ libelle, valeur, Icone, ton }) => (
          <div
            key={libelle}
            className="surface-card flex items-center gap-3 p-4"
          >
            <span className={cn('grid h-9 w-9 place-items-center rounded-full bg-shell', ton)}>
              <Icone aria-hidden className="h-4 w-4" />
            </span>
            <div>
              <p className="num text-[22px] font-semibold leading-none text-ink">{valeur}</p>
              <p className="mt-1 text-[10.5px] text-ink-mute">{libelle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          {tournees.map(([nom, courses]) => {
            const livrees = courses.filter((c) => c.statut === 'livre').length;
            return (
              <section
                key={nom}
                className="surface-card overflow-hidden"
                aria-label={nom}
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/[0.06] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent-deep">
                      <Bike className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-[14px] font-semibold text-ink">{nom}</h2>
                      <p className="text-[10.5px] text-ink-mute">
                        {courses.length} courses · {livrees} livrées ·{' '}
                        {t('livreur.aujourdhui').toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden
                      className="h-1.5 w-24 overflow-hidden rounded-pill bg-line/[0.08] dark:bg-white/10"
                    >
                      <span
                        className="block h-full rounded-pill bg-accent"
                        style={{ width: `${(livrees / Math.max(1, courses.length)) * 100}%` }}
                      />
                    </div>
                    <span className="num text-[10px] font-semibold text-ink-soft">
                      {Math.round((livrees / Math.max(1, courses.length)) * 100)} %
                    </span>
                  </div>
                </header>

                <ul className="divide-y divide-line/[0.05]">
                  {courses.map((course) => {
                    const colis = colisParNumero.get(course.numeroSuivi);
                    const terminée = course.statut === 'livre' || course.statut === 'echec';
                    return (
                      <li key={course.id} className="px-5 py-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-ink-soft ring-1 ring-line/[0.06]">
                              <MapPin aria-hidden className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  to={`/colis/${course.numeroSuivi}`}
                                  className="num text-[12px] font-semibold text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                  {course.numeroSuivi}
                                </Link>
                                <StatutBadge statut={course.statut} taille="sm" />
                              </div>
                              <p className="mt-1 truncate text-[11.5px] font-medium text-ink-soft">
                                {colis?.destinataire.nom ?? 'Destinataire'}{' '}
                                {colis ? `· ${colis.destinataire.telephone}` : ''}
                              </p>
                              <p className="mt-0.5 text-[10.5px] text-ink-mute">
                                {colis
                                  ? `${colis.destinataire.adresse}, ${colis.destinataire.ville}`
                                  : course.tournee}
                              </p>
                              {course.motifEchec ? (
                                <p className="mt-1 text-[10px] font-medium text-danger">
                                  {course.motifEchec}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 hidden items-center gap-1 rounded-pill bg-surface px-2 py-1 text-[9.5px] font-medium text-ink-mute sm:flex">
                              {heure(course.dateAffectation, langue)}
                            </span>
                            {!terminée ? (
                              <>
                                {course.statut === 'en_attente' ? (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => void changerStatut(course, 'en_transit')}
                                    loading={
                                      mutation.isPending &&
                                      mutation.variables?.id === course.id
                                    }
                                  >
                                    <Truck className="h-3 w-3" aria-hidden />
                                    {t('livreur.marquer_transit')}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => void changerStatut(course, 'livre')}
                                    loading={
                                      mutation.isPending &&
                                      mutation.variables?.id === course.id
                                    }
                                  >
                                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                                    {t('livreur.marquer_livre')}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger hover:bg-danger/10 hover:text-danger"
                                  onClick={() => {
                                    setEchecCible(course);
                                    setMotif('');
                                    setErreurMotif('');
                                  }}
                                >
                                  <TriangleAlert className="h-3 w-3" aria-hidden />
                                  {t('livreur.marquer_echec')}
                                </Button>
                              </>
                            ) : (
                              <Link
                                to={`/colis/${course.numeroSuivi}`}
                                className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[10.5px] font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                              >
                                {t('commun.voir')}
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 xl:col-span-4">
          {colisCarte ? (
            <MapOverview
              colis={colisCarte}
              className="min-h-[340px]"
              hauteur="min-h-[290px]"
            />
          ) : null}

          <section className="surface-card p-5">
            <h2 className="text-[15px] font-semibold text-ink">
              {t('dash.progression')}
            </h2>
            <div className="mt-3 space-y-2.5">
              {[
                { libelle: t('statut.livre'), valeur: stats.livrees, ton: 'bg-success' },
                {
                  libelle: t('statut.en_transit'),
                  valeur: liste.filter((l) => l.statut === 'en_transit').length,
                  ton: 'bg-accent',
                },
                {
                  libelle: t('statut.en_attente'),
                  valeur: liste.filter((l) => l.statut === 'en_attente').length,
                  ton: 'bg-warning',
                },
                { libelle: t('statut.echec'), valeur: stats.echecs, ton: 'bg-danger' },
              ].map((ligne) => (
                <div key={ligne.libelle} className="flex items-center gap-2">
                  <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', ligne.ton)} />
                  <span className="flex-1 text-[11px] text-ink-soft">{ligne.libelle}</span>
                  <span className="num text-[11px] font-semibold text-ink">{ligne.valeur}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-line/[0.06] pt-3 text-[10.5px] leading-relaxed text-ink-mute">
              Les mises à jour de statut sont immédiatement visibles par le client depuis
              son suivi. Pensez à renseigner un motif en cas d’échec.
            </p>
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(echecCible)}
        onClose={() => setEchecCible(null)}
        titre={t('livreur.marquer_echec')}
        description={echecCible?.numeroSuivi}
        taille="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEchecCible(null)}>
              {t('commun.annuler')}
            </Button>
            <Button
              variant="danger"
              loading={mutation.isPending}
              onClick={() => {
                if (motif.trim().length < 5) {
                  setErreurMotif(t('livreur.motif_requis'));
                  return;
                }
                if (echecCible) {
                  void changerStatut(echecCible, 'echec', motif.trim());
                }
              }}
            >
              {t('commun.confirmer')}
            </Button>
          </>
        }
      >
        <Textarea
          label={t('livreur.motif')}
          value={motif}
          onChange={(evenement) => {
            setMotif(evenement.target.value);
            setErreurMotif('');
          }}
          placeholder="Client absent, adresse introuvable, téléphone injoignable…"
          erreur={erreurMotif}
          required
        />
      </Modal>
    </div>
  );
}
