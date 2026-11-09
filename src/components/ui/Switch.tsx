import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';

/** Bascule Light / Dark en pilule noire, préférence mémorisée. */
export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const { t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('commun.theme')}
      className={cn(
        'relative flex items-center rounded-pill bg-[#111018] p-1 ring-1 ring-white/10',
        compact ? 'w-full' : 'w-full',
      )}
    >
      {(
        [
          { valeur: 'light' as const, label: t('commun.light'), Icone: Sun },
          { valeur: 'dark' as const, label: t('commun.dark'), Icone: Moon },
        ] satisfies {
          valeur: 'light' | 'dark';
          label: string;
          Icone: typeof Sun;
        }[]
      ).map(({ valeur, label, Icone }) => {
        const actif = theme === valeur;
        return (
          <button
            key={valeur}
            type="button"
            onClick={() => setTheme(valeur)}
            aria-pressed={actif}
            className={cn(
              'relative z-10 flex h-8 flex-1 items-center justify-center gap-1.5 rounded-pill text-[11px] font-semibold transition-colors',
              actif ? 'text-[#14121F]' : 'text-white/60 hover:text-white',
            )}
          >
            {actif ? (
              <motion.span
                layoutId="theme-thumb"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-pill bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
              />
            ) : null}
            <Icone aria-hidden className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
