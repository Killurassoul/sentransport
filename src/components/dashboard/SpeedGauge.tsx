import { motion, useReducedMotion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { SectionCard } from '@/components/ui/Card';
import { Counter } from '@/components/ui/Counter';
import { useI18n } from '@/hooks/useI18n';

const SEGMENTS = 34;
const RAYON = 82;
const CX = 110;
const CY = 110;
const ANGLE_DEPART = 135;
const BALAYAGE = 270;

function point(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + RAYON * Math.cos(rad), y: CY + RAYON * Math.sin(rad) };
}

function arc(index: number) {
  const pas = BALAYAGE / SEGMENTS;
  const debut = ANGLE_DEPART + index * pas + pas * 0.18;
  const fin = ANGLE_DEPART + (index + 1) * pas - pas * 0.18;
  const a = point(debut);
  const b = point(fin);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${RAYON} ${RAYON} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

const ARCS = Array.from({ length: SEGMENTS }, (_, index) => arc(index));

export function SpeedGauge({
  pourcentage,
  aLheure,
  enRetard,
}: {
  pourcentage: number;
  aLheure: number;
  enRetard: number;
}) {
  const { t, langue } = useI18n();
  const reduit = useReducedMotion();
  const remplis = Math.round((Math.min(100, Math.max(0, pourcentage)) / 100) * SEGMENTS);

  return (
    <SectionCard
      titre={t('dash.progression')}
      icone={<Activity className="h-3.5 w-3.5" />}
      className="h-full"
      contentClassName="flex h-full flex-col items-center justify-center gap-3 pt-1"
    >
      <div className="relative mx-auto w-full max-w-[218px]">
        <svg
          viewBox="0 0 220 220"
          className="w-full"
          role="img"
          aria-label={`${t('dash.ponctualite')} : ${pourcentage} %. ${aLheure} ${t('dash.a_lheure')}, ${enRetard} ${t('dash.en_retard')}.`}
        >
          {ARCS.map((chemin, index) => {
            const actif = index < remplis;
            return (
              <motion.path
                key={index}
                d={chemin}
                fill="none"
                strokeLinecap="round"
                strokeWidth={11}
                className={actif ? 'stroke-accent' : 'stroke-line/[0.09] dark:stroke-white/10'}
                initial={reduit ? false : { opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{
                  duration: 0.45,
                  delay: reduit ? 0 : index * 0.018,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}
          <circle
            cx={CX}
            cy={CY}
            r={62}
            fill="none"
            className="stroke-line/[0.05] dark:stroke-white/[0.06]"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
          <p className="flex items-start gap-0.5 text-[42px] font-semibold leading-none tracking-[-0.05em] text-ink">
            <Counter valeur={pourcentage} langue={langue} />
            <span className="mt-1.5 text-base font-medium tracking-normal text-ink-mute">%</span>
          </p>
          <p className="mt-1 text-[11px] font-medium text-ink-mute">
            {t('dash.ponctualite')}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#E7F7ED] px-2.5 py-1 text-[11px] font-medium text-[#15803D] dark:bg-success/15 dark:text-[#86EFAC]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {t('dash.a_lheure')}
          <b className="num font-semibold">{aLheure}</b>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-[#FDF3E2] px-2.5 py-1 text-[11px] font-medium text-[#8A5A08] dark:bg-warning/15 dark:text-[#FBBF24]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {t('dash.en_retard')}
          <b className="num font-semibold">{enRetard}</b>
        </span>
      </div>

      <div
        aria-hidden
        className="flex h-1.5 w-full max-w-[220px] overflow-hidden rounded-pill bg-line/[0.07] dark:bg-white/10"
      >
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${pourcentage}%` }}
          transition={{ duration: reduit ? 0 : 1, delay: reduit ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-pill bg-accent"
        />
        <span className="h-full flex-1 rounded-pill bg-warning/70" />
      </div>
      <p className="text-center text-[11px] text-ink-mute">
        {aLheure + enRetard} {t('dash.colis_livres')}
      </p>
    </SectionCard>
  );
}
