import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  Package,
  Route,
  Settings,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { NAV_ESPACE, NAV_PRINCIPALE, type NavItem } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeSwitch } from '@/components/ui/Switch';

const ICONES = {
  dashboard: LayoutDashboard,
  colis: Package,
  livraisons: Truck,
  carte: Map,
  messages: MessageSquare,
  parametres: Settings,
  tournees: Route,
  admin: ShieldCheck,
} as const;

function ItemNav({
  item,
  badge,
  onNavigate,
}: {
  item: NavItem;
  badge?: number;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const Icone = ICONES[item.icone];

  return (
    <NavLink
      to={item.to}
      end={!['/colis', '/livraisons'].includes(item.to)}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex h-9 items-center gap-2.5 rounded-pill px-3 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          isActive
            ? 'bg-accent text-white shadow-[0_8px_18px_rgba(124,92,252,0.28)]'
            : 'text-ink-soft hover:bg-surface hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icone
            aria-hidden
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105',
              isActive ? 'text-white' : 'text-ink-mute group-hover:text-ink-soft',
            )}
          />
          <span className="truncate">{t(item.cle as 'nav.dashboard')}</span>
          {badge && badge > 0 ? (
            <span
              className={cn(
                'num ml-auto grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[9px] font-bold',
                isActive ? 'bg-white/25 text-white' : 'bg-accent text-white',
              )}
            >
              {badge > 9 ? '9+' : badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { t } = useI18n();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const notifications = useUIStore((s) => s.notifications);
  const nonLus = notifications.filter((n) => !n.lu).length;

  const espace = NAV_ESPACE.filter(
    (item) => !item.roles || (utilisateur && item.roles.includes(utilisateur.role)),
  );

  return (
    <aside className="hidden w-[190px] shrink-0 flex-col px-2 py-3 lg:flex">
      <div className="px-2 pb-6 pt-1">
        <Logo />
      </div>

      <nav aria-label="Navigation principale" className="flex flex-col gap-1">
        <p className="label-caps mb-1 px-3">{t('nav.section.principal')}</p>
        {NAV_PRINCIPALE.map((item) => (
          <ItemNav
            key={item.to}
            item={item}
            badge={item.icone === 'messages' ? nonLus : undefined}
          />
        ))}

        {espace.length > 0 ? (
          <>
            <p className="label-caps mb-1 mt-5 px-3">{t('nav.section.espace')}</p>
            {espace.map((item) => (
              <ItemNav key={item.to} item={item} />
            ))}
          </>
        ) : null}
      </nav>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        <ThemeSwitch />
        {utilisateur ? (
          <NavLink
            to="/parametres"
            className="flex items-center gap-2.5 rounded-[16px] border border-line/[0.05] bg-surface p-2.5 transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Avatar prenom={utilisateur.prenom} nom={utilisateur.nom} taille="sm" enLigne />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-ink">
                {utilisateur.prenom} {utilisateur.nom}
              </span>
              <span className="block truncate text-[10px] text-ink-mute">
                {t(`role.${utilisateur.role}`)}
              </span>
            </span>
          </NavLink>
        ) : null}
        <p className="px-1 text-[9px] leading-relaxed text-ink-mute/80">
          SenTransport · Dakar
        </p>
      </div>
    </aside>
  );
}
