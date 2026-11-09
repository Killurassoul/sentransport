import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardCheck,
  Mail,
  MapPin,
  Moon,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  Sun,
  Truck,
} from 'lucide-react';
import type { StatutColis } from '@/api/types';
import { useSuiviPublic } from '@/api/hooks/colis';
import { Logo } from '@/components/ui/Logo';
import { Badge, StatutBadge } from '@/components/ui/Badge';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressFrise } from '@/components/ui/ProgressFrise';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapOverview } from '@/components/dashboard/MapOverview';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { codeVille } from '@/lib/constants';
import { dateHeure, dateLongue, heure, nombre } from '@/lib/format';
import { cn } from '@/lib/cn';

const ICONES: Record<StatutColis, typeof Package> = {
  en_attente: ClipboardCheck,
  pris_en_charge: PackageCheck,
  en_transit: Truck,
  livre: Check,
  echec: CircleAlert,
};

function BarrePublique({ titre }: { titre?: string }) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const { t } = useI18n();
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="hidden rounded-pill bg-shell/70 px-2.5 py-1 text-[10px] font-medium text-ink-soft backdrop-blur sm:block">
          {titre ?? t('app.tagline')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('commun.light') : t('commun.dark')}
          className="grid h-9 w-9 place-items-center rounded-full border border-line/[0.08] bg-shell/70 text-ink-soft backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          to="/login"
          className={buttonVariants({ variant: 'primary', size: 'sm' })}
        >
          {t('login.connexion')}
        </Link>
      </div>
    </header>
  );
}

function RechercheSuivi({
  valeurInitiale = '',
  onRecherche,
  compact = false,
}: {
  valeurInitiale?: string;
  onRecherche: (numero: string) => void;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [numero, setNumero] = useState(valeurInitiale);
  const [erreur, setErreur] = useState('');

  const envoyer = (evenement: React.FormEvent) => {
    evenement.preventDefault();
    const valeur = numero.trim().toUpperCase();
    if (!/^ST-\d{4}-\d{5}$/.test(valeur)) {
      setErreur('Format attendu : ST-2026-00417');
      return;
    }
    setErreur('');
    onRecherche(valeur);
  };

  return (
    <form onSubmit={envoyer} className="w-full" noValidate>
      <div className={cn('flex gap-2', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row')}>
        <Input
          value={numero}
          onChange={(evenement) => {
            setNumero(evenement.target.value);
            setErreur('');
          }}
          placeholder={t('suivi.placeholder')}
          aria-label={t('dash.suivi')}
          icone={<Search className="h-4 w-4" />}
          erreur={erreur}
          className={compact ? 'h-11' : 'h-12 rounded-[16px] bg-surface text-sm'}
          conteneurClassName="flex-1"
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="accent"
          size={compact ? 'md' : 'lg'}
          className={compact ? 'sm:h-11' : 'h-12 shrink-0'}
        >
          {t('suivi.bouton')}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

export function SuiviPage() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  const { t, langue } = useI18n();
  const { data: colis, isLoading, isError } = useSuiviPublic(numero);

  const rechercher = (valeur: string) => navigate(`/suivi/${valeur}`);

  if (!numero) {
    return (
      <div className="min-h-screen px-3 py-4 sm:p-6">
        <div className="mx-auto flex max-w-[1020px] flex-col gap-6">
          <BarrePublique titre={t('suivi.titre')} />

          <section className="overflow-hidden rounded-shell bg-shell shadow-shell">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-10">
                <Badge ton="accent" point>
                  Suivi public · sans connexion
                </Badge>
                <h1 className="mt-4 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[42px]">
                  {t('suivi.titre')}
                </h1>
                <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">
                  {t('suivi.sous_titre')}
                </p>

                <div className="mt-6 max-w-lg">
                  <RechercheSuivi onRecherche={rechercher} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10.5px] text-ink-mute">
                  <span>Essayez :</span>
                  {['ST-2026-00417', 'ST-2026-00416'].map((exemple) => (
                    <button
                      key={exemple}
                      type="button"
                      onClick={() => navigate(`/suivi/${exemple}`)}
                      className="num rounded-pill border border-line/10 bg-surface px-2 py-0.5 font-medium text-ink-soft transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {exemple}
                    </button>
                  ))}
                </div>

                <ul className="mt-8 space-y-2.5">
                  {[t('auth.point1'), t('auth.point2'), t('auth.point3')].map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-[12px] text-ink-soft">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-accent-soft text-accent-deep">
                        <Check aria-hidden className="h-3 w-3" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#4B34B8] via-[#6B49F0] to-[#8F75FF] p-8 lg:block">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
                    backgroundSize: '44px 44px',
                  }}
                />
                <div className="relative flex h-full flex-col justify-center">
                  <div className="rounded-[20px] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                        Colis
                      </span>
                      <span className="rounded-pill bg-white/20 px-2 py-0.5 text-[9.5px] font-semibold text-white">
                        En transit
                      </span>
                    </div>
                    <p className="num mt-2 text-[15px] font-semibold text-white">
                      ST-2026-00417
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-white/50">Dakar</p>
                        <p className="num text-[30px] font-semibold leading-none text-white">DKR</p>
                      </div>
                      <div className="flex flex-1 items-center px-3" aria-hidden>
                        <span className="h-px flex-1 border-t border-dashed border-white/40" />
                        <Truck className="mx-1 h-4 w-4 text-white/70" />
                        <span className="h-px flex-1 border-t border-dashed border-white/40" />
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-[0.14em] text-white/50">Thiès</p>
                        <p className="num text-[30px] font-semibold leading-none text-white">THS</p>
                      </div>
                    </div>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-[72%] rounded-full bg-white" />
                    </div>
                    <div className="mt-2 flex justify-between text-[9px] text-white/60">
                      <span>Enregistré</span>
                      <span>Livraison prévue demain</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5 rounded-[16px] border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
                      <MapPin className="h-4 w-4 text-white" />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium text-white">Mariama Diallo</p>
                      <p className="text-[9.5px] text-white/60">Cité Lamy, Thiès</p>
                    </div>
                    <ShieldCheck className="ml-auto h-4 w-4 text-white/50" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10.5px] text-ink-mute">
            <span>{t('pied.mention')}</span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              {t('suivi.assistance')}
            </span>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:p-6">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-4">
        <BarrePublique titre={t('suivi.titre_colis')} />

        <div className="rounded-shell bg-shell p-3 shadow-shell sm:p-4">
          <RechercheSuivi valeurInitiale={numero} onRecherche={rechercher} compact />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="h-[180px] rounded-card" />
            <div className="grid gap-4 lg:grid-cols-12">
              <Skeleton className="h-[320px] rounded-card lg:col-span-8" />
              <Skeleton className="h-[320px] rounded-card lg:col-span-4" />
            </div>
          </div>
        ) : isError || !colis ? (
          <div className="rounded-shell bg-shell p-8 text-center shadow-shell">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">
              <CircleAlert className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-[17px] font-semibold text-ink">
              {t('suivi.introuvable')}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-[12px] text-ink-soft">
              Vérifiez le numéro inscrit sur votre bordereau (format ST-AAAA-XXXXX) puis
              réessayez.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                to="/suivi"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                {t('commun.rechercher')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="rounded-shell bg-shell p-5 shadow-shell sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent-deep">
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatutBadge statut={colis.statut} />
                      <span className="num text-[11px] text-ink-mute">{colis.numeroSuivi}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="num text-[26px] font-semibold leading-none text-ink">
                        {codeVille(colis.villeDepart)}
                      </p>
                      <ArrowRight className="h-4 w-4 text-ink-mute" aria-hidden />
                      <p className="num text-[26px] font-semibold leading-none text-accent">
                        {codeVille(colis.villeArrivee)}
                      </p>
                    </div>
                    <p className="mt-2 text-[11px] text-ink-mute">
                      {t('dash.livraison_estimee')} ·{' '}
                      {dateHeure(colis.dateLivraisonPrevue, langue)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-ink-mute">{t('dash.poids')}</p>
                  <p className="num text-[13px] font-semibold text-ink">
                    {nombre(colis.poidsKg, langue, 1)} kg
                  </p>
                  <p className="mt-1 text-[10px] text-ink-mute">
                    {colis.destinataire.nom} · {colis.destinataire.ville}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <ProgressFrise statut={colis.statut} />
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-12">
              <section
                className="rounded-card bg-shell p-5 shadow-shell lg:col-span-7"
                aria-labelledby="frise-publique"
              >
                <h2 id="frise-publique" className="text-[15px] font-semibold text-ink">
                  {t('colis.detail.historique')}
                </h2>
                <p className="mt-0.5 text-[10.5px] text-ink-mute">
                  Chaque étape est horodatée dès sa validation par le livreur.
                </p>

                <ol className="relative mt-4">
                  <span
                    aria-hidden
                    className="absolute bottom-4 left-[15px] top-4 w-px bg-line/10 dark:bg-white/10"
                  />
                  {[...colis.historique]
                    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                    .map((evenement, index) => {
                      const Icone = ICONES[evenement.statut];
                      const actuel = index === 0;
                      return (
                        <li key={evenement.id} className="relative flex gap-3 pb-4 last:pb-0">
                          <span
                            className={cn(
                              'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-shell',
                              evenement.statut === 'echec'
                                ? 'bg-danger text-white'
                                : actuel
                                  ? 'bg-accent text-white'
                                  : 'bg-surface-sunken text-ink-mute',
                            )}
                          >
                            <Icone aria-hidden className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <p
                                className={cn(
                                  'text-[12px]',
                                  actuel ? 'font-semibold text-ink' : 'text-ink-soft',
                                )}
                              >
                                {evenement.libelle}
                              </p>
                              <time className="num text-[9.5px] text-ink-mute">
                                {dateHeure(evenement.date, langue)}
                              </time>
                            </div>
                            <p className="mt-0.5 text-[10px] text-ink-mute">{evenement.lieu}</p>
                          </div>
                        </li>
                      );
                    })}
                </ol>
              </section>

              <div className="flex flex-col gap-4 lg:col-span-5">
                <MapOverview
                  colis={colis}
                  afficherEntete={false}
                  hauteur="min-h-[260px]"
                  className="min-h-[285px]"
                />

                <section className="rounded-card bg-shell p-5 shadow-shell">
                  <h2 className="text-[13px] font-semibold text-ink">
                    {t('dash.destinataire')}
                  </h2>
                  <p className="mt-1.5 text-[12px] font-medium text-ink">
                    {colis.destinataire.nom}
                  </p>
                  <p className="num text-[11px] text-ink-mute">
                    {colis.destinataire.telephone}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-soft">
                    {colis.destinataire.adresse}, {colis.destinataire.ville}
                  </p>
                  <div className="mt-3 border-t border-line/[0.06] pt-3 text-[10.5px] text-ink-mute">
                    Colis créé le {dateLongue(colis.dateCreation, langue)} · livraison
                    prévue à {heure(colis.dateLivraisonPrevue, langue)}
                  </div>
                  <p className="mt-3 text-[10.5px] text-ink-soft">
                    {t('suivi.assistance')}
                  </p>
                </section>
              </div>
            </div>
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-4 text-[10.5px] text-ink-mute">
          <span>{t('pied.mention')}</span>
          <Link to="/login" className="font-medium text-accent hover:underline">
            {t('login.connexion')} →
          </Link>
        </footer>
      </div>
    </div>
  );
}
