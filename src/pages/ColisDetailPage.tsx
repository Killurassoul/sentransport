import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Check,
  CircleAlert,
  ClipboardCheck,
  Copy,
  MapPin,
  Package,
  PackageCheck,
  Pencil,
  Printer,
  Scale,
  Trash2,
  Truck,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useColis, useSupprimerColis } from '@/api/hooks/colis';
import { useUtilisateurs } from '@/api/hooks/users';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/hooks/useI18n';
import { StatutBadge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressFrise } from '@/components/ui/ProgressFrise';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { CourierCard } from '@/components/dashboard/CourierCard';
import { MapOverview } from '@/components/dashboard/MapOverview';
import { BordereauModal } from '@/features/colis/BordereauModal';
import { ColisEditModal } from '@/features/colis/ColisEditModal';
import { codeVille } from '@/lib/constants';
import { dateHeure, dateLongue, heure, nombre } from '@/lib/format';
import type { StatutColis } from '@/api/types';
import { cn } from '@/lib/cn';

const ICONES_EVENEMENT: Record<StatutColis, typeof Package> = {
  en_attente: ClipboardCheck,
  pris_en_charge: PackageCheck,
  en_transit: Truck,
  livre: Check,
  echec: CircleAlert,
};

export function ColisDetailPage() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { t, langue } = useI18n();
  const { data: colis, isLoading, isError, error, refetch } = useColis(numero);
  const { data: livreurs } = useUtilisateurs('livreur');
  const supprimer = useSupprimerColis();
  const ajouterNotification = useUIStore((s) => s.ajouterNotification);
  const role = useAuthStore((s) => s.utilisateur?.role);
  const [edition, setEdition] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [bordereau, setBordereau] = useState(false);
  const [copie, setCopie] = useState(false);

  const peutModifier = role !== 'livreur';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-[190px] rounded-card" />
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-[380px] rounded-card xl:col-span-8" />
          <div className="flex flex-col gap-4 xl:col-span-4">
            <Skeleton className="h-[220px] rounded-card" />
            <Skeleton className="h-[240px] rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !colis) {
    const introuvable =
      (error as { status?: number } | null)?.status === 404 || !colis;
    return (
      <div className="surface-card">
        {introuvable ? (
          <EmptyState
            variante="recherche"
            titre={t('colis.detail.introuvable')}
            texte="Vérifiez le numéro de suivi ou revenez à la liste de vos colis."
            action={
              <Link to="/colis" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                {t('nav.colis')}
              </Link>
            }
          />
        ) : (
          <ErrorState
            message={error instanceof Error ? error.message : t('commun.erreur_reseau')}
            onRetry={() => void refetch()}
            className="border-0 bg-transparent"
          />
        )}
      </div>
    );
  }

  const livreur = livreurs?.find((l) => l.id === colis.livreurId);
  const enRetard =
    colis.statut !== 'livre' && +new Date(colis.dateLivraisonPrevue) < Date.now();
  const joursRetard = enRetard
    ? Math.max(
        1,
        Math.ceil(
          (Date.now() - +new Date(colis.dateLivraisonPrevue)) / (24 * 3600 * 1000),
        ),
      )
    : 0;
  const historique = [...colis.historique].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(colis.numeroSuivi);
      setCopie(true);
      toast.success('Numéro de suivi copié');
      window.setTimeout(() => setCopie(false), 1800);
    } catch {
      toast.error('Copie indisponible sur ce navigateur');
    }
  };

  const supprimerColis = async () => {
    try {
      await supprimer.mutateAsync(colis.id);
      ajouterNotification({
        titre: `Colis ${colis.numeroSuivi} supprimé`,
        texte: 'Le bordereau et l’historique ont été retirés du suivi.',
        ton: 'warning',
      });
      toast.success(t('colis.detail.supprime'));
      navigate('/colis', { replace: true });
    } catch (erreur) {
      toast.error(
        erreur instanceof Error ? erreur.message : t('commun.erreur'),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-deep">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatutBadge statut={colis.statut} />
                <span className="text-[10.5px] text-ink-mute">
                  Créé le {dateHeure(colis.dateCreation, langue)}
                </span>
                {enRetard ? (
                  <span className="rounded-pill bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                    {t('colis.detail.retard')} · {joursRetard} j
                  </span>
                ) : (
                  <span className="rounded-pill bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-[#15803D] dark:text-[#86EFAC]">
                    {t('colis.detail.a_temps')}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="num text-[24px] font-semibold leading-none tracking-[-0.03em] text-ink">
                  {codeVille(colis.villeDepart)}
                </p>
                <ArrowRight aria-hidden className="h-4 w-4 text-ink-mute" />
                <p className="num text-[24px] font-semibold leading-none tracking-[-0.03em] text-accent">
                  {codeVille(colis.villeArrivee)}
                </p>
                <span className="ml-1 hidden text-[11px] text-ink-mute sm:block">
                  {colis.villeDepart} → {colis.villeArrivee}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void copier()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="num">{colis.numeroSuivi}</span>
                {copie ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBordereau(true)}
              iconLeft={<Printer className="h-3.5 w-3.5" />}
            >
              {t('colis.detail.bordereau')}
            </Button>
            {peutModifier ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setEdition(true)}
                  iconLeft={<Pencil className="h-3.5 w-3.5" />}
                >
                  {t('commun.modifier')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmation(true)}
                  aria-label={t('commun.supprimer')}
                  className="text-danger hover:bg-danger/10 hover:text-danger"
                  iconLeft={<Trash2 className="h-3.5 w-3.5" />}
                >
                  <span className="hidden sm:inline">{t('commun.supprimer')}</span>
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <ProgressFrise statut={colis.statut} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line/[0.06] pt-4 sm:grid-cols-4">
          {[
            {
              libelle: t('dash.poids'),
              valeur: `${nombre(colis.poidsKg, langue, 1)} kg`,
              Icone: Scale,
            },
            {
              libelle: t('dash.trajet'),
              valeur: `${nombre(colis.distanceKm, langue)} km`,
              Icone: MapPin,
            },
            {
              libelle: t('dash.livraison_estimee'),
              valeur: dateHeure(colis.dateLivraisonPrevue, langue),
              Icone: CalendarClock,
            },
            {
              libelle: 'Montant',
              valeur: `${nombre(colis.prixFcfa, langue)} FCFA`,
              Icone: Wallet,
            },
          ].map(({ libelle, valeur, Icone }) => (
            <div key={libelle} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-shell text-ink-soft ring-1 ring-line/[0.06] dark:bg-white/[0.04]">
                <Icone aria-hidden className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <dt className="text-[10px] font-medium text-ink-mute">{libelle}</dt>
                <dd className="num mt-0.5 truncate text-[11.5px] font-semibold text-ink">
                  {valeur}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          <section className="surface-card p-5" aria-labelledby="historique-suivi">
            <header className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.06] text-ink-soft">
                  <Truck className="h-3.5 w-3.5" />
                </span>
                <h2 id="historique-suivi" className="text-[15px] font-semibold text-ink">
                  {t('colis.detail.historique')}
                </h2>
              </div>
              <span className="rounded-pill bg-surface px-2.5 py-1 text-[10px] font-medium text-ink-mute">
                {historique.length} étapes
              </span>
            </header>

            <ol className="relative">
              <span
                aria-hidden
                className="absolute bottom-4 left-[15px] top-4 w-px bg-line/10 dark:bg-white/10"
              />
              {historique.map((evenement, index) => {
                const Icone = ICONES_EVENEMENT[evenement.statut];
                const actuel = index === 0;
                const echec = evenement.statut === 'echec';
                return (
                  <li key={evenement.id} className="relative flex gap-3 pb-4 last:pb-0">
                    <span
                      className={cn(
                        'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-surface',
                        echec
                          ? 'bg-danger text-white'
                          : actuel
                            ? 'bg-accent text-white'
                            : 'bg-surface-sunken text-ink-mute',
                      )}
                    >
                      <Icone aria-hidden className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <p
                          className={cn(
                            'text-[12.5px]',
                            actuel ? 'font-semibold text-ink' : 'font-medium text-ink-soft',
                          )}
                        >
                          {evenement.libelle}
                        </p>
                        <time
                          dateTime={evenement.date}
                          className="num shrink-0 text-[10px] text-ink-mute"
                        >
                          {dateHeure(evenement.date, langue)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-[10.5px] text-ink-mute">
                        {evenement.lieu}
                        {evenement.acteur ? ` · ${evenement.acteur}` : ''}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="surface-card p-5" aria-labelledby="informations-colis">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 id="informations-colis" className="text-[15px] font-semibold text-ink">
                {t('colis.detail.informations')}
              </h2>
              <span className="text-[10px] text-ink-mute">
                {dateLongue(colis.dateCreation, langue)}
              </span>
            </div>

            <p className="rounded-[12px] bg-shell/70 px-3.5 py-3 text-[12px] text-ink-soft dark:bg-white/[0.03]">
              {colis.description}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { titre: t('dash.expediteur'), data: colis.expediteur, Icone: PackageCheck },
                { titre: t('dash.destinataire'), data: colis.destinataire, Icone: MapPin },
              ].map(({ titre, data, Icone }) => (
                <div
                  key={titre}
                  className="rounded-[16px] border border-line/[0.06] p-3.5"
                >
                  <p className="label-caps flex items-center gap-1.5">
                    <Icone aria-hidden className="h-3 w-3" />
                    {titre}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-ink">{data.nom}</p>
                  <p className="num text-[11px] text-ink-mute">{data.telephone}</p>
                  <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">
                    {data.adresse}, {data.ville}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/[0.06] pt-3 text-[10.5px] text-ink-mute">
              <span>
                Livraison prévue à {heure(colis.dateLivraisonPrevue, langue)} ·{' '}
                {dateLongue(colis.dateLivraisonPrevue, langue)}
              </span>
              {colis.dateLivraison ? (
                <span className="font-medium text-[#15803D] dark:text-[#86EFAC]">
                  Livré le {dateHeure(colis.dateLivraison, langue)}
                </span>
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <section className="surface-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">
                  {t('colis.detail.bordereau')}
                </h2>
                <p className="mt-0.5 text-[10.5px] text-ink-mute">
                  Prêt à imprimer · QR de suivi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBordereau(true)}
                aria-label={t('commun.imprimer')}
                className="grid h-8 w-8 place-items-center rounded-full bg-surface text-ink-soft transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 rounded-[14px] border border-dashed border-line/15 bg-shell/60 p-3.5 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                  SenTransport
                </span>
                <StatutBadge statut={colis.statut} taille="sm" />
              </div>
              <p className="num mt-2 text-[13px] font-semibold text-ink">
                {colis.numeroSuivi}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="num text-[18px] font-semibold leading-none text-ink">
                    {codeVille(colis.villeDepart)}
                  </p>
                  <p className="text-[9px] text-ink-mute">{colis.villeDepart}</p>
                </div>
                <span aria-hidden className="h-px flex-1 border-t border-dashed border-ink-mute/50 mx-3" />
                <div className="text-right">
                  <p className="num text-[18px] font-semibold leading-none text-accent">
                    {codeVille(colis.villeArrivee)}
                  </p>
                  <p className="text-[9px] text-ink-mute">{colis.villeArrivee}</p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setBordereau(true)}
              iconLeft={<Printer className="h-3.5 w-3.5" />}
            >
              {t('commun.imprimer')}
            </Button>
          </section>

          <MapOverview
            colis={colis}
            afficherEntete={false}
            hauteur="min-h-[230px]"
            className="min-h-[255px]"
          />

          {livreur ? (
            <CourierCard livreur={livreur} />
          ) : (
            <section className="surface-card p-5">
              <h2 className="text-[15px] font-semibold text-ink">{t('dash.livreur_assigne')}</h2>
              <p className="mt-1.5 text-[11.5px] text-ink-soft">
                Aucun livreur affecté pour l’instant. L’affectation se fait depuis
                l’administration ou lors de la constitution de la tournée.
              </p>
            </section>
          )}
        </div>
      </div>

      <BordereauModal open={bordereau} onClose={() => setBordereau(false)} colis={colis} />
      <ColisEditModal open={edition} onClose={() => setEdition(false)} colis={colis} />

      <Modal
        open={confirmation}
        onClose={() => setConfirmation(false)}
        titre={t('colis.detail.supprimer_titre')}
        description={t('colis.detail.supprimer_texte')}
        taille="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmation(false)}>
              {t('commun.annuler')}
            </Button>
            <Button
              variant="danger"
              loading={supprimer.isPending}
              onClick={() => void supprimerColis()}
              iconLeft={<Trash2 className="h-4 w-4" />}
            >
              {t('commun.supprimer')}
            </Button>
          </>
        }
      >
        <p className="text-[12.5px] text-ink-soft">
          <span className="num font-semibold text-ink">{colis.numeroSuivi}</span> —{' '}
          {colis.destinataire.nom}, {colis.villeArrivee}. Cette suppression est
          irréversible.
        </p>
      </Modal>
    </div>
  );
}
