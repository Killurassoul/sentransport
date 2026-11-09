import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home, Search } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { buttonVariants } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/store/auth';

export function NotFoundPage() {
  const { t } = useI18n();
  const token = useAuthStore((s) => s.token);

  return (
    <div className="flex min-h-screen flex-col px-4 py-5 sm:px-6">
      <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col">
        <header className="flex items-center justify-between gap-3">
          <Logo />
          <Link
            to={token ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-medium text-ink-soft transition-colors hover:bg-shell hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {token ? t('erreur.retour_dashboard') : t('login.connexion')}
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <div className="relative">
            <p className="num select-none text-[96px] font-bold leading-none tracking-[-0.06em] text-accent/15 sm:text-[128px]">
              404
            </p>
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-shell text-accent shadow-card ring-1 ring-line/[0.06]">
                <Compass className="h-7 w-7" />
              </span>
            </span>
          </div>

          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-ink">
            {t('erreur.404.titre')}
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">
            {t('erreur.404.texte')} Vérifiez l’adresse ou reprenez depuis le tableau de
            bord.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              to={token ? '/dashboard' : '/login'}
              className={buttonVariants({ variant: 'primary', size: 'md' })}
            >
              <Home className="h-4 w-4" aria-hidden />
              {token ? t('erreur.retour_dashboard') : t('login.connexion')}
            </Link>
            <Link
              to="/suivi"
              className={buttonVariants({ variant: 'secondary', size: 'md' })}
            >
              <Search className="h-4 w-4" aria-hidden />
              {t('suivi.titre')}
            </Link>
          </div>

          <svg
            viewBox="0 0 520 110"
            className="mt-12 h-[90px] w-full max-w-[520px] text-accent/40"
            fill="none"
            aria-hidden
          >
            <path
              d="M14 86C110 86 110 34 190 34s92 48 164 48 92-58 152-58"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeDasharray="2 9"
              strokeLinecap="round"
            />
            <circle cx="14" cy="86" r="5" fill="currentColor" />
            <circle cx="190" cy="34" r="4" fill="currentColor" opacity="0.7" />
            <circle cx="354" cy="82" r="4" fill="currentColor" opacity="0.7" />
            <circle cx="506" cy="24" r="5" fill="currentColor" />
          </svg>
        </main>

        <footer className="pb-3 text-center text-[10px] text-ink-mute">
          {t('pied.mention')}
        </footer>
      </div>
    </div>
  );
}
