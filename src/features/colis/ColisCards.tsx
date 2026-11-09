import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, MapPin, Scale } from 'lucide-react';
import type { Colis } from '@/api/types';
import { StatutBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressFrise } from '@/components/ui/ProgressFrise';
import { codeVille } from '@/lib/constants';
import { dateCourte, nombre } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';

export function ColisCards({ colis }: { colis: Colis[] }) {
  const { t, langue } = useI18n();
  return (
    <ul className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
      {colis.map((c) => (
        <li key={c.id}>
          <Link
            to={`/colis/${c.numeroSuivi}`}
            className="group flex h-full flex-col gap-3 rounded-[18px] border border-line/[0.06] bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="num truncate text-[12.5px] font-semibold text-ink">
                  {c.numeroSuivi}
                </p>
                <p className="mt-0.5 truncate text-[10.5px] text-ink-mute">
                  {c.description}
                </p>
              </div>
              <StatutBadge statut={c.statut} taille="sm" />
            </div>

            <div className="flex items-center justify-between rounded-[12px] bg-shell/70 px-3 py-2 dark:bg-white/[0.03]">
              <span className="num text-[15px] font-semibold text-ink">
                {codeVille(c.villeDepart)}
              </span>
              <span className="flex flex-1 items-center px-2" aria-hidden>
                <span className="h-px flex-1 border-t border-dashed border-ink-mute/50" />
                <ChevronRight className="h-3 w-3 text-ink-mute" />
              </span>
              <span className="num text-[15px] font-semibold text-accent">
                {codeVille(c.villeArrivee)}
              </span>
            </div>

            <ProgressFrise statut={c.statut} compact />

            <div className="flex items-center gap-2">
              <Avatar
                prenom={c.destinataire.nom.split(' ')[0] ?? ''}
                nom={c.destinataire.nom.split(' ')[1] ?? ''}
                taille="xs"
              />
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-medium text-ink">
                  {c.destinataire.nom}
                </p>
                <p className="flex items-center gap-1 truncate text-[10px] text-ink-mute">
                  <MapPin aria-hidden className="h-2.5 w-2.5" />
                  {c.destinataire.ville}
                </p>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-line/[0.06] pt-2.5 text-[10px] text-ink-mute">
              <span className="flex items-center gap-1">
                <Scale aria-hidden className="h-3 w-3" />
                <span className="num">{nombre(c.poidsKg, langue, 1)} kg</span>
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays aria-hidden className="h-3 w-3" />
                {dateCourte(c.dateCreation, langue)}
              </span>
              <span className="sr-only">{t('commun.voir')}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
