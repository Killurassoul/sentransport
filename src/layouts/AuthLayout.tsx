import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Moon, Sun } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useI18n } from '@/hooks/useI18n';
import { useUIStore } from '@/store/ui';

function PanneauIllustration() {
  const { t } = useI18n();
  return (
    <section className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#4B34B8] p-10 text-white lg:flex">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_0%,#8F75FF_0%,#6B49F0_38%,#3B2798_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(80% 60% at 50% 40%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(80% 60% at 50% 40%, black, transparent)',
        }}
      />

      <svg
        aria-hidden
        viewBox="0 0 600 400"
        className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[560px] text-white/60"
        fill="none"
      >
        <path
          d="M40 330C130 300 120 190 220 176S390 230 470 130 560 60 620 54"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="2 10"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="40" cy="330" r="6" fill="#fff" />
        <circle cx="220" cy="176" r="4" fill="#fff" opacity="0.8" />
        <circle cx="470" cy="130" r="6" fill="#fff" />
        <circle cx="470" cy="130" r="14" stroke="#fff" strokeOpacity="0.35" />
      </svg>

      <div className="relative z-10 flex items-center justify-between">
        <Logo clair />
        <span className="rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur">
          Sénégal · 2026
        </span>
      </div>

      <div className="relative z-10 max-w-[420px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          SenTransport
        </p>
        <h2 className="mt-3 text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.035em]">
          {t('auth.visuel_titre')}
        </h2>
        <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">
          {t('auth.visuel_texte')}
        </p>

        <ul className="mt-8 space-y-3">
          {[t('auth.point1'), t('auth.point2'), t('auth.point3')].map((point) => (
            <li key={point} className="flex items-center gap-3 text-[13px] text-white/85">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15">
                <Check aria-hidden className="h-3 w-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md"
      >
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-white/90">ST-2026-00417</span>
          <span className="rounded-pill bg-white/20 px-2 py-0.5 font-semibold text-white">
            En transit
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Départ</p>
            <p className="text-[22px] font-semibold leading-none">DKR</p>
          </div>
          <svg viewBox="0 0 80 12" className="mx-3 h-3 flex-1 text-white/50" aria-hidden>
            <path
              d="M2 6h76"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeDasharray="2 5"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Arrivée</p>
            <p className="text-[22px] font-semibold leading-none">THS</p>
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          {['Enregistré', 'Pris en charge', 'En transit', 'Livré'].map((etape, index) => (
            <div key={etape} className="flex-1">
              <div
                className={`h-[3px] rounded-full ${index <= 2 ? 'bg-white' : 'bg-white/25'}`}
              />
              <p
                className={`mt-1.5 text-[8.5px] leading-tight ${
                  index <= 2 ? 'font-medium text-white/80' : 'text-white/40'
                }`}
              >
                {etape}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function AuthLayout() {
  const { t } = useI18n();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <div className="min-h-screen p-0 sm:p-4 lg:p-6">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] overflow-hidden bg-shell sm:min-h-[calc(100vh-32px)] sm:rounded-shell sm:shadow-shell lg:min-h-[calc(100vh-48px)]">
        <PanneauIllustration />

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-5 pb-2 pt-5 sm:px-8">
            <Link
              to="/suivi"
              className="inline-flex items-center gap-1.5 rounded-pill px-2 py-1 text-[11.5px] font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
              {t('suivi.titre')}
            </Link>
            <div className="flex items-center gap-2">
              <div className="lg:hidden">
                <Logo compact />
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('commun.light') : t('commun.dark')}
                className="grid h-9 w-9 place-items-center rounded-full border border-line/[0.07] bg-surface text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[408px] flex-1 flex-col justify-center px-5 py-8 sm:px-8">
            <Outlet />
          </div>

          <p className="px-8 pb-6 text-center text-[10px] text-ink-mute">
            {t('pied.mention')}
          </p>
        </section>
      </div>
    </div>
  );
}
