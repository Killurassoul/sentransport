import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Command, Plus, Search, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import type { CleTraduction } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { buttonVariants } from '@/components/ui/Button';
import { NotificationsPanel } from './NotificationsPanel';

function enteteDepuisChemin(
  pathname: string,
  t: (cle: CleTraduction, variables?: Record<string, string | number>) => string,
  prenom: string,
  role?: string,
) {
  if (pathname === '/dashboard') {
    const sousTitre =
      role === 'livreur'
        ? t('header.sous_titre_livreur')
        : role === 'administrateur'
          ? t('header.sous_titre_admin')
          : t('header.sous_titre');
    return { titre: t('header.retour', { prenom }), sousTitre };
  }
  if (pathname === '/colis/nouveau') {
    return { titre: t('colis.creation.titre'), sousTitre: t('colis.creation.sous_titre') };
  }
  if (pathname.startsWith('/colis/')) {
    return {
      titre: t('colis.detail.titre', { numero: decodeURIComponent(pathname.replace('/colis/', '')) }),
      sousTitre: t('entete.detail'),
    };
  }
  if (pathname === '/colis') {
    return { titre: t('colis.titre'), sousTitre: t('entete.colis') };
  }
  if (pathname === '/livraisons') {
    return { titre: t('livraisons.titre'), sousTitre: t('livraisons.sous_titre') };
  }
  if (pathname === '/carte') {
    return { titre: t('carte.titre'), sousTitre: t('carte.sous_titre') };
  }
  if (pathname === '/messages') {
    return { titre: t('messages.titre'), sousTitre: t('messages.sous_titre') };
  }
  if (pathname === '/parametres') {
    return { titre: t('parametres.titre'), sousTitre: t('parametres.sous_titre') };
  }
  if (pathname === '/livreur') {
    return { titre: t('livreur.titre'), sousTitre: t('livreur.sous_titre') };
  }
  if (pathname === '/admin') {
    return { titre: t('admin.titre'), sousTitre: t('admin.sous_titre') };
  }
  return { titre: t('app.tagline'), sousTitre: '' };
}

export function Header() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const setPaletteOuverte = useUIStore((s) => s.setPaletteOuverte);
  const nonLus = useUIStore((s) => s.notifications.filter((n) => !n.lu).length);
  const [notificationsOuvertes, setNotificationsOuvertes] = useState(false);

  const peutCreer =
    utilisateur?.role === 'client' || utilisateur?.role === 'administrateur';
  const { titre, sousTitre } = enteteDepuisChemin(
    pathname,
    t,
    utilisateur?.prenom ?? '',
    utilisateur?.role,
  );

  return (
    <header className="flex flex-col gap-4 px-4 pb-2 pt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-5 lg:pb-1 lg:pt-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="lg:hidden">
          <Logo compact />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[21px] font-semibold leading-tight tracking-[-0.03em] text-ink lg:text-[24px]">
            {titre}
          </h1>
          {sousTitre ? (
            <p className="mt-1 line-clamp-1 text-[12px] text-ink-mute lg:text-[13px]">
              {sousTitre}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:shrink-0">
        <button
          type="button"
          onClick={() => setPaletteOuverte(true)}
          className="hidden h-10 w-[272px] items-center gap-2 rounded-pill border border-line/[0.07] bg-surface px-3.5 text-left text-[12px] text-ink-mute transition-colors hover:border-line/15 hover:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:flex"
        >
          <Search aria-hidden className="h-3.5 w-3.5" />
          <span className="flex-1 truncate">{t('header.recherche')}</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-line/10 bg-shell px-1.5 py-0.5 text-[9px] font-medium text-ink-mute">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setPaletteOuverte(true)}
          aria-label={t('header.recherche_court')}
          className="grid h-10 w-10 place-items-center rounded-full border border-line/[0.07] bg-surface text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOuvertes((v) => !v)}
            aria-label={t('header.notifications')}
            aria-expanded={notificationsOuvertes}
            aria-controls="panneau-notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-line/[0.07] bg-surface text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Bell className="h-4 w-4" />
            {nonLus > 0 ? (
              <span className="num absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[8px] font-bold text-white ring-2 ring-shell">
                {nonLus > 9 ? '9+' : nonLus}
              </span>
            ) : null}
          </button>
          <NotificationsPanel
            id="panneau-notifications"
            ouvert={notificationsOuvertes}
            onFermer={() => setNotificationsOuvertes(false)}
          />
        </div>

        <Link
          to="/parametres"
          aria-label={t('header.parametres')}
          className="hidden h-10 w-10 place-items-center rounded-full border border-line/[0.07] bg-surface text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {peutCreer && pathname !== '/colis/nouveau' ? (
          <Link
            to="/colis/nouveau"
            className={buttonVariants({
              variant: 'accent',
              size: 'md',
              className: 'hidden sm:inline-flex',
            })}
          >
            <Plus aria-hidden className="h-4 w-4" />
            {t('header.nouveau_colis')}
          </Link>
        ) : null}

        {peutCreer && pathname !== '/colis/nouveau' ? (
          <Link
            to="/colis/nouveau"
            aria-label={t('header.nouveau_colis')}
            className={cn(
              buttonVariants({ variant: 'accent', size: 'icon', className: 'sm:hidden' }),
              'h-10 w-10',
            )}
          >
            <Plus aria-hidden className="h-4 w-4" />
          </Link>
        ) : null}

        {utilisateur ? (
          <Link
            to="/parametres"
            aria-label={t('header.parametres')}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
          >
            <Avatar prenom={utilisateur.prenom} nom={utilisateur.nom} taille="sm" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
