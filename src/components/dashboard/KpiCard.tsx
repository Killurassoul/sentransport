import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Counter } from '@/components/ui/Counter';
import { useI18n } from '@/hooks/useI18n';
import { decimal } from '@/lib/format';
import type { PointMini } from './MiniChart';

export interface KpiCardProps {
  libelle: string;
  valeur: number;
  decimales?: number;
  unite?: string;
  icone: ReactNode;
  variation?: number | null;
  graphique: ReactNode;
  /** Série utilisée pour le résumé accessible. */
  serie?: PointMini[];
  /** Légende affichée quand aucune variation n'est pertinente. */
  legende?: string;
  className?: string;
  delay?: number;
}

export function KpiCard({
  libelle,
  valeur,
  decimales = 0,
  unite,
  icone,
  variation,
  graphique,
  serie,
  legende,
  className,
  delay = 0,
}: KpiCardProps) {
  const { t, langue } = useI18n();
  const positif = (variation ?? 0) >= 0;

  const resumeSerie = serie
    ?.map((point) => `${point.label} : ${decimal(point.valeur, langue, decimales)}`)
    .join(', ');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        'white-card group flex flex-col justify-between gap-4 p-5 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(90,70,170,0.13)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-soft">{libelle}</p>
          <p className="mt-2 flex items-baseline gap-1.5 text-[34px] font-semibold leading-none tracking-[-0.035em] text-ink">
            <Counter valeur={valeur} decimales={decimales} langue={langue} />
            {unite ? (
              <span className="text-[13px] font-medium tracking-normal text-ink-mute">
                {unite}
              </span>
            ) : null}
          </p>
        </div>
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111018] text-white shadow-[0_6px_14px_rgba(17,16,24,0.18)] dark:bg-[#F4F2FF] dark:text-[#14121F]"
        >
          {icone}
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {typeof variation === 'number' ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-pill px-2 py-1 text-[11px] font-semibold',
                positif
                  ? 'bg-[#E7F7ED] text-[#15803D] dark:bg-success/15 dark:text-[#86EFAC]'
                  : 'bg-[#FDECEC] text-[#B42318] dark:bg-danger/15 dark:text-[#FCA5A5]',
              )}
            >
              {positif ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {positif ? '+' : '−'}
              {decimal(Math.abs(variation), langue, 1)} %
            </span>
          ) : null}
          <p className={cn('text-[11px] text-ink-mute', typeof variation === 'number' && 'mt-1.5')}>
            {typeof variation === 'number'
              ? t('kpi.vs_mois')
              : (legende ?? t('kpi.vs_mois'))}
          </p>
        </div>
        <div
          className="w-[46%] max-w-[150px]"
          role="img"
          aria-label={
            resumeSerie
              ? `${libelle} — ${resumeSerie}`
              : `Graphique ${libelle}`
          }
        >
          {graphique}
        </div>
      </div>
    </motion.article>
  );
}
