import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Package, Settings, Truck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/hooks/useI18n';
import type { CleTraduction } from '@/lib/i18n';

const ITEMS = [
  { to: '/dashboard', cle: 'nav.dashboard', Icone: LayoutDashboard, exact: true },
  { to: '/colis', cle: 'nav.colis', Icone: Package, exact: false },
  { to: '/livraisons', cle: 'nav.livraisons', Icone: Truck, exact: false },
  { to: '/carte', cle: 'nav.carte', Icone: Map, exact: true },
  { to: '/parametres', cle: 'nav.parametres', Icone: Settings, exact: true },
] satisfies {
  to: string;
  cle: CleTraduction;
  Icone: typeof LayoutDashboard;
  exact: boolean;
}[];

export function MobileNav() {
  const { t } = useI18n();
  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/[0.06] bg-shell/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {ITEMS.map(({ to, cle, Icone, exact }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  'mx-auto flex w-full max-w-[72px] flex-col items-center gap-1 rounded-2xl py-1.5 text-[9.5px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-ink-mute hover:text-ink-soft',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full transition-colors',
                      isActive ? 'bg-accent-soft text-accent-deep dark:text-accent' : 'text-ink-mute',
                    )}
                  >
                    <Icone aria-hidden className="h-[18px] w-[18px]" />
                  </span>
                  <span className="truncate">{t(cle)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
