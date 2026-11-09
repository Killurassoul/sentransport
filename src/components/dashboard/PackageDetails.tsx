import { ArrowUpRight, CalendarDays, MapPin, Package, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Colis } from '@/api/types';
import { SectionCard } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatutBadge } from '@/components/ui/Badge';
import { ProgressFrise } from '@/components/ui/ProgressFrise';
import { dateCourte } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';

export function PackageDetails({ colis }: { colis: Colis }) {
  const { t, langue } = useI18n();
  const destinataire = colis.destinataire;

  return (
    <SectionCard
      titre={t('dash.details_colis')}
      icone={<Package className="h-3.5 w-3.5" />}
      className="h-full"
      contentClassName="flex flex-col gap-4"
      action={
        <Link
          to={`/colis/${colis.numeroSuivi}`}
          aria-label={`${t('commun.voir')} ${colis.numeroSuivi}`}
          className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-shell hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="num text-[13px] font-semibold tracking-wide text-ink">
          {colis.numeroSuivi}
        </p>
        <StatutBadge statut={colis.statut} taille="sm" />
      </div>

      <ProgressFrise statut={colis.statut} compact />

      <div className="rounded-[16px] border border-line/[0.05] bg-shell/70 p-3.5 dark:bg-white/[0.03]">
        <p className="label-caps">{t('dash.destinataire')}</p>
        <div className="mt-2.5 flex items-center gap-2.5">
          <Avatar prenom={destinataire.nom.split(' ')[0] ?? ''} nom={destinataire.nom.split(' ')[1] ?? ''} taille="md" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">
              {destinataire.nom}
            </p>
            <p className="num text-[11px] text-ink-mute">{destinataire.telephone}</p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-ink-soft">
          <MapPin aria-hidden className="mt-px h-3.5 w-3.5 shrink-0 text-ink-mute" />
          <span>
            {destinataire.adresse}, {destinataire.ville}
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-line/[0.06] pt-3 text-[11px] text-ink-mute">
        <span className="flex items-center gap-1.5">
          <Scale aria-hidden className="h-3.5 w-3.5" />
          <span className="num font-medium text-ink-soft">
            {colis.poidsKg.toLocaleString(langue === 'fr' ? 'fr-FR' : 'en-GB')} kg
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays aria-hidden className="h-3.5 w-3.5" />
          {dateCourte(colis.dateCreation, langue)}
        </span>
      </div>
    </SectionCard>
  );
}
