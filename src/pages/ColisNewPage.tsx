import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Package,
  PackagePlus,
  Pencil,
  Route,
  Scale,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreerColis } from '@/api/hooks/colis';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { VILLES_NOMS, codeVille, distanceEntre } from '@/lib/constants';
import { dateCourte, dateHeure, nombre, toDateTimeLocal } from '@/lib/format';
import { cn } from '@/lib/cn';
import { schemaColis, type DonneesColis } from '@/features/auth/schemas';
import { normaliserErreur } from '@/api/client';

const ETAPES = [
  { cle: 'colis.creation.etape.expediteur', Icone: UserRound, champs: ['expediteur'] as const },
  { cle: 'colis.creation.etape.destinataire', Icone: MapPin, champs: ['destinataire'] as const },
  {
    cle: 'colis.creation.etape.description',
    Icone: Package,
    champs: ['description', 'poidsKg', 'villeDepart', 'villeArrivee', 'dateLivraisonPrevue'] as const,
  },
  { cle: 'colis.creation.etape.recap', Icone: Check, champs: [] as const },
];

function demain() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(14, 0, 0, 0);
  return toDateTimeLocal(date.toISOString());
}

export function ColisNewPage() {
  const { t, langue } = useI18n();
  const navigate = useNavigate();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const ajouterNotification = useUIStore((s) => s.ajouterNotification);
  const creation = useCreerColis();
  const [etape, setEtape] = useState(0);

  const schema = useMemo(() => schemaColis(t), [t]);
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DonneesColis>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      expediteur: {
        nom: `${utilisateur?.prenom ?? ''} ${utilisateur?.nom ?? ''}`.trim(),
        telephone: utilisateur?.telephone ?? '',
        adresse: '',
        ville: utilisateur?.ville ?? 'Dakar',
      },
      destinataire: { nom: '', telephone: '', adresse: '', ville: 'Thiès' },
      description: '',
      poidsKg: 2,
      villeDepart: utilisateur?.ville ?? 'Dakar',
      villeArrivee: 'Thiès',
      dateLivraisonPrevue: demain(),
    },
  });

  const valeurs = watch();
  const distance = distanceEntre(valeurs.villeDepart, valeurs.villeArrivee);
  const prix = 1500 + Math.round(Number(valeurs.poidsKg || 0) * 450) + distance * 12;

  const suivant = async () => {
    const champs = ETAPES[etape]?.champs;
    if (champs && champs.length > 0) {
      const valide = await trigger([...champs] as never);
      if (!valide) return;
    }
    setEtape((valeur) => Math.min(ETAPES.length - 1, valeur + 1));
  };

  const envoyer = handleSubmit(async (donnees) => {
    try {
      const colis = await creation.mutateAsync({
        expediteur: donnees.expediteur,
        destinataire: donnees.destinataire,
        description: donnees.description,
        poidsKg: Number(donnees.poidsKg),
        villeDepart: donnees.villeDepart,
        villeArrivee: donnees.villeArrivee,
        dateLivraisonPrevue: new Date(donnees.dateLivraisonPrevue).toISOString(),
      });
      ajouterNotification({
        titre: `Colis ${colis.numeroSuivi} enregistré`,
        texte: `En attente de prise en charge pour ${colis.destinataire.ville}.`,
        ton: 'accent',
        href: `/colis/${colis.numeroSuivi}`,
      });
      toast.success(t('colis.creation.succes'), {
        description: `${colis.numeroSuivi} · ${colis.destinataire.nom}`,
      });
      navigate(`/colis/${colis.numeroSuivi}`, { replace: true });
    } catch (erreur) {
      setError('root', { message: normaliserErreur(erreur).message });
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-4">
      <div className="surface-card overflow-hidden">
        <div className="border-b border-line/[0.06] px-5 py-4">
          <ol className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {ETAPES.map((definition, index) => {
              const complete = index < etape;
              const active = index === etape;
              return (
                <li key={definition.cle} className="flex flex-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (index < etape) setEtape(index);
                    }}
                    disabled={index > etape}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'flex min-w-0 items-center gap-2 rounded-pill px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      index <= etape ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors',
                        active
                          ? 'bg-accent text-white'
                          : complete
                            ? 'bg-accent-soft text-accent-deep'
                            : 'bg-surface text-ink-mute',
                      )}
                    >
                      {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        'hidden truncate text-[11px] font-medium sm:block',
                        active ? 'text-ink' : complete ? 'text-ink-soft' : 'text-ink-mute',
                      )}
                    >
                      {t(definition.cle as 'colis.creation.etape.expediteur')}
                    </span>
                  </button>
                  {index < ETAPES.length - 1 ? (
                    <span
                      aria-hidden
                      className={cn(
                        'h-px min-w-3 flex-1',
                        index < etape ? 'bg-accent/40' : 'bg-line/10',
                      )}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <form onSubmit={envoyer} noValidate>
          <div className="p-5 sm:p-6">
            {etape === 0 ? (
              <section aria-labelledby="etape-expediteur">
                <header className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent-deep">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 id="etape-expediteur" className="text-[15px] font-semibold text-ink">
                      {t('colis.creation.etape.expediteur')}
                    </h2>
                    <p className="text-[11px] text-ink-mute">
                      Qui confie le colis à SenTransport ?
                    </p>
                  </div>
                </header>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nom complet"
                    autoComplete="name"
                    erreur={errors.expediteur?.nom?.message}
                    required
                    {...register('expediteur.nom')}
                  />
                  <Input
                    label={t('dash.telephone')}
                    type="tel"
                    erreur={errors.expediteur?.telephone?.message}
                    required
                    {...register('expediteur.telephone')}
                  />
                  <Input
                    label={t('dash.adresse')}
                    conteneurClassName="sm:col-span-2"
                    erreur={errors.expediteur?.adresse?.message}
                    placeholder="Quartier, rue, numéro"
                    required
                    {...register('expediteur.adresse')}
                  />
                  <Select
                    label={t('register.ville')}
                    options={VILLES_NOMS.map((ville) => ({ value: ville, label: ville }))}
                    erreur={errors.expediteur?.ville?.message}
                    required
                    {...register('expediteur.ville')}
                  />
                </div>
              </section>
            ) : null}

            {etape === 1 ? (
              <section aria-labelledby="etape-destinataire">
                <header className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent-deep">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 id="etape-destinataire" className="text-[15px] font-semibold text-ink">
                      {t('colis.creation.etape.destinataire')}
                    </h2>
                    <p className="text-[11px] text-ink-mute">
                      À qui le colis doit-il être remis ?
                    </p>
                  </div>
                </header>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nom complet"
                    autoComplete="off"
                    erreur={errors.destinataire?.nom?.message}
                    required
                    {...register('destinataire.nom')}
                  />
                  <Input
                    label={t('dash.telephone')}
                    type="tel"
                    autoComplete="off"
                    erreur={errors.destinataire?.telephone?.message}
                    required
                    {...register('destinataire.telephone')}
                  />
                  <Input
                    label={t('dash.adresse')}
                    conteneurClassName="sm:col-span-2"
                    erreur={errors.destinataire?.adresse?.message}
                    placeholder="Quartier, rue, point de repère"
                    required
                    {...register('destinataire.adresse')}
                  />
                  <Select
                    label={t('register.ville')}
                    options={VILLES_NOMS.map((ville) => ({ value: ville, label: ville }))}
                    erreur={errors.destinataire?.ville?.message}
                    required
                    {...register('destinataire.ville')}
                  />
                </div>
              </section>
            ) : null}

            {etape === 2 ? (
              <section aria-labelledby="etape-description">
                <header className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent-deep">
                    <Package className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 id="etape-description" className="text-[15px] font-semibold text-ink">
                      {t('colis.creation.etape.description')}
                    </h2>
                    <p className="text-[11px] text-ink-mute">
                      Contenu, poids et itinéraire du colis.
                    </p>
                  </div>
                </header>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Textarea
                    label="Description du contenu"
                    conteneurClassName="sm:col-span-2"
                    placeholder="Ex. documents notariés sous enveloppe renforcée"
                    erreur={errors.description?.message}
                    required
                    {...register('description')}
                  />
                  <Input
                    label="Poids (kg)"
                    type="number"
                    min={0.1}
                    step={0.1}
                    inputMode="decimal"
                    erreur={errors.poidsKg?.message}
                    required
                    {...register('poidsKg')}
                  />
                  <Input
                    label="Livraison estimée"
                    type="datetime-local"
                    erreur={errors.dateLivraisonPrevue?.message}
                    required
                    {...register('dateLivraisonPrevue')}
                  />
                  <Select
                    label="Ville de départ"
                    options={VILLES_NOMS.map((ville) => ({ value: ville, label: ville }))}
                    erreur={errors.villeDepart?.message}
                    required
                    {...register('villeDepart')}
                  />
                  <Select
                    label="Ville d’arrivée"
                    options={VILLES_NOMS.map((ville) => ({ value: ville, label: ville }))}
                    erreur={errors.villeArrivee?.message}
                    required
                    {...register('villeArrivee')}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-surface px-4 py-3">
                  <span className="flex items-center gap-2 text-[11.5px] text-ink-soft">
                    <Route aria-hidden className="h-3.5 w-3.5 text-ink-mute" />
                    {codeVille(valeurs.villeDepart)} → {codeVille(valeurs.villeArrivee)}
                    <span className="num text-ink-mute">· {distance} km</span>
                  </span>
                  <span className="flex items-center gap-2 text-[11.5px] text-ink-soft">
                    <Scale aria-hidden className="h-3.5 w-3.5 text-ink-mute" />
                    <span className="num font-semibold text-ink">
                      {nombre(prix, langue)} FCFA
                    </span>
                    <span className="text-ink-mute">estimé</span>
                  </span>
                </div>
              </section>
            ) : null}

            {etape === 3 ? (
              <section aria-labelledby="etape-recap">
                <header className="mb-4 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-accent-deep">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 id="etape-recap" className="text-[15px] font-semibold text-ink">
                      {t('colis.creation.etape.recap')}
                    </h2>
                    <p className="text-[11px] text-ink-mute">
                      Vérifiez les informations avant création.
                    </p>
                  </div>
                </header>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { titre: t('dash.expediteur'), personne: valeurs.expediteur, etapeCible: 0 },
                    { titre: t('dash.destinataire'), personne: valeurs.destinataire, etapeCible: 1 },
                  ].map((bloc) => (
                    <div
                      key={bloc.titre}
                      className="rounded-[16px] border border-line/[0.06] bg-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="label-caps">{bloc.titre}</p>
                        <button
                          type="button"
                          onClick={() => setEtape(bloc.etapeCible)}
                          className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-medium text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                          {t('commun.modifier')}
                        </button>
                      </div>
                      <p className="mt-2 text-[13px] font-semibold text-ink">
                        {bloc.personne?.nom || '—'}
                      </p>
                      <p className="num text-[11px] text-ink-mute">
                        {bloc.personne?.telephone}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">
                        {bloc.personne?.adresse}
                        {bloc.personne?.ville ? `, ${bloc.personne.ville}` : ''}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-[16px] border border-line/[0.06] bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="label-caps">{t('dash.info_livraison')}</p>
                    <button
                      type="button"
                      onClick={() => setEtape(2)}
                      className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-medium text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                      {t('commun.modifier')}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="num text-[24px] font-semibold leading-none text-ink">
                        {codeVille(valeurs.villeDepart)}
                      </p>
                      <p className="mt-1 text-[10.5px] text-ink-mute">{valeurs.villeDepart}</p>
                    </div>
                    <div className="flex flex-1 items-center px-2" aria-hidden>
                      <span className="h-px flex-1 border-t border-dashed border-ink-mute/50" />
                      <ArrowRight className="h-3.5 w-3.5 text-ink-mute" />
                    </div>
                    <div className="text-right">
                      <p className="num text-[24px] font-semibold leading-none text-accent">
                        {codeVille(valeurs.villeArrivee)}
                      </p>
                      <p className="mt-1 text-[10.5px] text-ink-mute">{valeurs.villeArrivee}</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line/[0.06] pt-3 text-[11px]">
                    <div>
                      <dt className="text-ink-mute">Contenu</dt>
                      <dd className="mt-0.5 font-medium text-ink">{valeurs.description || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-mute">Poids</dt>
                      <dd className="num mt-0.5 font-medium text-ink">
                        {nombre(Number(valeurs.poidsKg || 0), langue, 1)} kg
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-mute">Livraison estimée</dt>
                      <dd className="mt-0.5 font-medium text-ink">
                        {valeurs.dateLivraisonPrevue
                          ? dateHeure(new Date(valeurs.dateLivraisonPrevue).toISOString(), langue)
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-mute">Tarif estimé</dt>
                      <dd className="num mt-0.5 font-semibold text-accent">
                        {nombre(prix, langue)} FCFA
                      </dd>
                    </div>
                  </dl>
                </div>

                <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-accent/[0.04] px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
                  <PackagePlus aria-hidden className="mt-px h-3.5 w-3.5 shrink-0 text-accent" />
                  Le colis sera créé avec le statut « En attente ». Un livreur pourra être
                  affecté depuis l’administration ou automatiquement à la prochaine tournée.
                </p>
              </section>
            ) : null}

            {errors.root?.message ? (
              <div
                role="alert"
                className="mt-4 rounded-[14px] border border-danger/25 bg-danger/[0.06] px-3.5 py-2.5 text-[12px] font-medium text-danger"
              >
                {errors.root.message}
              </div>
            ) : null}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line/[0.06] px-5 py-4">
            <Link
              to="/colis"
              className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-[12px] font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('commun.annuler')}
            </Link>

            <div className="flex items-center gap-2">
              <span className="mr-1 hidden text-[10.5px] text-ink-mute sm:block">
                Étape {etape + 1} / {ETAPES.length}
              </span>
              {etape > 0 ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setEtape((valeur) => Math.max(0, valeur - 1))}
                >
                  {t('commun.precedent')}
                </Button>
              ) : null}
              {etape < ETAPES.length - 1 ? (
                <Button variant="primary" size="md" onClick={() => void suivant()}>
                  {t('commun.suivant')}
                  <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  loading={isSubmitting || creation.isPending}
                >
                  <Check aria-hidden className="h-3.5 w-3.5" />
                  Créer le colis
                </Button>
              )}
            </div>
          </footer>
        </form>
      </div>

      <p className="px-1 text-[10px] text-ink-mute">
        Créé le {dateCourte(new Date().toISOString(), langue)} · Les tarifs sont estimés
        selon le poids et la distance.
      </p>
    </div>
  );
}
