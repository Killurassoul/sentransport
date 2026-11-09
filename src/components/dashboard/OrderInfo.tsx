import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Check,
  ChevronDown,
  Copy,
  Info,
  MapPin,
  Phone,
  Scale,
  Truck,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Colis } from '@/api/types';
import { SectionCard } from '@/components/ui/Card';
import { StatutBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { buttonVariants } from '@/components/ui/Button';
import { codeVille } from '@/lib/constants';
import { dateCourte, heure, nombre } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/cn';

function BlocInfo({
  icone,
  libelle,
  children,
}: {
  icone: React.ReactNode;
  libelle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="label-caps flex items-center gap-1.5">
        <span className="text-ink-mute" aria-hidden>
          {icone}
        </span>
        {libelle}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function OrderInfo({
  colis,
  autresColis = [],
  livreur,
  onChangerColis,
}: {
  colis: Colis;
  autresColis?: Colis[];
  livreur?: { prenom: string; nom: string };
  onChangerColis?: (id: string) => void;
}) {
  const { t, langue } = useI18n();
  const [copie, setCopie] = useState(false);
  const depart = codeVille(colis.villeDepart);
  const arrivee = codeVille(colis.villeArrivee);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(colis.numeroSuivi);
      setCopie(true);
      toast.success(`${t('dash.suivi')} ${colis.numeroSuivi} ${t('dash.copie').toLowerCase()}`, {
        description: 'Collez-le où vous voulez partager le suivi.',
      });
      window.setTimeout(() => setCopie(false), 1800);
    } catch {
      toast.error('La copie automatique est indisponible sur ce navigateur.');
    }
  };

  return (
    <SectionCard
      titre={t('dash.info_livraison')}
      icone={<Info className="h-3.5 w-3.5" />}
      className="h-full"
      contentClassName="flex h-full flex-col gap-4"
      action={
        autresColis.length > 0 && onChangerColis ? (
          <div className="relative">
            <label htmlFor="autre-colis" className="sr-only">
              {t('dash.autre_colis')}
            </label>
            <select
              id="autre-colis"
              value={colis.id}
              onChange={(evenement) => onChangerColis(evenement.target.value)}
              className="h-7 max-w-[132px] appearance-none truncate rounded-pill border border-line/[0.08] bg-shell pl-2.5 pr-7 text-[11px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-white/[0.04]"
            >
              {[colis, ...autresColis].map((option) => (
                <option key={option.id} value={option.id}>
                  {option.numeroSuivi}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-mute"
            />
          </div>
        ) : undefined
      }
    >
      {/* Trajet */}
      <div className="rounded-[18px] border border-line/[0.05] bg-shell/70 p-3.5 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="label-caps">{t('dash.depart')}</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.04em] text-ink">
              {depart}
            </p>
            <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] text-ink-mute">
              <MapPin aria-hidden className="h-3 w-3" />
              {colis.villeDepart}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center px-1">
            <span className="relative flex w-full items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-ink-mute/40"
              />
              <span className="relative grid h-7 w-7 place-items-center rounded-full bg-[#111018] text-white shadow-[0_4px_12px_rgba(17,16,24,0.2)] dark:bg-[#F4F2FF] dark:text-[#14121F]">
                <Truck className="h-3.5 w-3.5" />
              </span>
            </span>
            <p className="num mt-2 text-center text-[10px] font-medium text-ink-mute">
              {nombre(colis.distanceKm, langue)} km
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="label-caps">{t('dash.arrivee')}</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.04em] text-accent">
              {arrivee}
            </p>
            <p className="mt-1.5 flex items-center justify-end gap-1 truncate text-[11px] text-ink-mute">
              <MapPin aria-hidden className="h-3 w-3" />
              {colis.villeArrivee}
            </p>
          </div>
        </div>
      </div>

      {/* Numéro de suivi */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="label-caps">{t('dash.suivi')}</p>
          <p className="num mt-1 text-[15px] font-semibold tracking-[0.01em] text-ink">
            {colis.numeroSuivi}
          </p>
        </div>
        <button
          type="button"
          onClick={copier}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            copie
              ? 'border-success/30 bg-success/10 text-[#15803D] dark:text-[#86EFAC]'
              : 'border-line/10 bg-shell text-ink-soft hover:text-ink dark:bg-white/[0.04]',
          )}
        >
          {copie ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copie ? t('dash.copie') : t('dash.copier')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 border-t border-line/[0.06] pt-3.5 sm:grid-cols-4">
        <BlocInfo icone={<CalendarClock className="h-3.5 w-3.5" />} libelle={t('dash.livraison_estimee')}>
          <p className="text-[13px] font-semibold leading-tight text-ink">
            {dateCourte(colis.dateLivraisonPrevue, langue)}
          </p>
          <p className="num text-[11px] text-ink-mute">
            {heure(colis.dateLivraisonPrevue, langue)}
          </p>
        </BlocInfo>

        <BlocInfo icone={<Check className="h-3.5 w-3.5" />} libelle={t('colis.colonnes.statut')}>
          <StatutBadge statut={colis.statut} taille="sm" />
        </BlocInfo>

        <BlocInfo icone={<Scale className="h-3.5 w-3.5" />} libelle={t('dash.poids')}>
          <p className="num text-[13px] font-semibold text-ink">
            {nombre(colis.poidsKg, langue, 1)} <span className="text-ink-mute">kg</span>
          </p>
          <p className="text-[11px] text-ink-mute">
            {nombre(colis.prixFcfa, langue)} FCFA
          </p>
        </BlocInfo>

        <BlocInfo icone={<UserRound className="h-3.5 w-3.5" />} libelle={t('dash.livreur_assigne')}>
          {livreur ? (
            <div className="flex items-center gap-2">
              <Avatar prenom={livreur.prenom} nom={livreur.nom} taille="xs" />
              <span className="truncate text-[12px] font-semibold text-ink">
                {livreur.prenom} {livreur.nom}
              </span>
            </div>
          ) : (
            <span className="text-[12px] text-ink-mute">À affecter</span>
          )}
        </BlocInfo>
      </div>

      <div className="mt-auto flex gap-2">
        <Link
          to={`/colis/${colis.numeroSuivi}`}
          className={buttonVariants({ variant: 'primary', size: 'md', className: 'flex-1' })}
        >
          {t('dash.suivre')}
        </Link>
        <a
          href={`tel:${colis.destinataire.telephone.replace(/\s/g, '')}`}
          className={buttonVariants({ variant: 'secondary', size: 'md', className: 'flex-1' })}
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {t('dash.contacter')}
        </a>
      </div>
    </SectionCard>
  );
}
