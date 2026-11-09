import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useReducedMotion } from 'framer-motion';
import { useUIStore } from '@/store/ui';

export interface PointMini {
  label: string;
  valeur: number;
}

const COULEURS = {
  light: { plein: '#7C5CFC', clair: '#DCD4FC', aire: '#EDE8FE' },
  dark: { plein: '#8F75FF', clair: '#3B3268', aire: '#292346' },
};

export function MiniBars({
  donnees,
  hauteur = 52,
}: {
  donnees: PointMini[];
  hauteur?: number;
}) {
  const reduit = useReducedMotion();
  const theme = useUIStore((s) => s.theme);
  const couleurs = COULEURS[theme];

  return (
    <div style={{ height: hauteur }} className="w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={donnees} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} barCategoryGap="24%">
          <Bar
            dataKey="valeur"
            radius={[4, 4, 4, 4]}
            isAnimationActive={!reduit}
            animationDuration={850}
            animationEasing="ease-out"
          >
            {donnees.map((point, index) => (
              <Cell
                key={`${point.label}-${index}`}
                fill={
                  index >= donnees.length - 3 ? couleurs.plein : couleurs.clair
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniArea({
  donnees,
  hauteur = 52,
  identifiant,
}: {
  donnees: PointMini[];
  hauteur?: number;
  identifiant: string;
}) {
  const reduit = useReducedMotion();
  const theme = useUIStore((s) => s.theme);
  const couleurs = COULEURS[theme];

  return (
    <div style={{ height: hauteur }} className="w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={donnees} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`aire-${identifiant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={couleurs.plein} stopOpacity={0.28} />
              <stop offset="100%" stopColor={couleurs.plein} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="valeur"
            stroke={couleurs.plein}
            strokeWidth={2}
            fill={`url(#aire-${identifiant})`}
            dot={false}
            isAnimationActive={!reduit}
            animationDuration={950}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
