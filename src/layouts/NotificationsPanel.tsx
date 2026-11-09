import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, PackageCheck, Truck, TriangleAlert } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { depuis } from '@/lib/format';
import { cn } from '@/lib/cn';

const ICONES = {
  accent: Truck,
  success: PackageCheck,
  warning: TriangleAlert,
  info: Truck,
} as const;

export function NotificationsPanel({
  ouvert,
  onFermer,
  id,
}: {
  ouvert: boolean;
  onFermer: () => void;
  id: string;
}) {
  const { t, langue } = useI18n();
  const notifications = useUIStore((s) => s.notifications);
  const marquerToutLu = useUIStore((s) => s.marquerToutLu);
  const marquerLu = useUIStore((s) => s.marquerLu);
  const nonLus = notifications.filter((n) => !n.lu).length;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const surClic = (evenement: MouseEvent) => {
      if (ref.current && !ref.current.contains(evenement.target as Node)) onFermer();
    };
    const surEchap = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') onFermer();
    };
    document.addEventListener('mousedown', surClic);
    document.addEventListener('keydown', surEchap);
    return () => {
      document.removeEventListener('mousedown', surClic);
      document.removeEventListener('keydown', surEchap);
    };
  }, [ouvert, onFermer]);

  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          ref={ref}
          id={id}
          role="dialog"
          aria-label={t('notif.titre')}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16 }}
          className="absolute right-0 top-11 z-50 w-[min(92vw,370px)] overflow-hidden rounded-[20px] border border-line/[0.08] bg-shell shadow-pop"
        >
          <header className="flex items-center justify-between gap-2 border-b border-line/[0.06] px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">{t('notif.titre')}</p>
              <p className="text-[10px] text-ink-mute">
                {nonLus > 0 ? t('notif.non_lus', { n: nonLus }) : t('notif.vide')}
              </p>
            </div>
            <button
              type="button"
              onClick={marquerToutLu}
              disabled={nonLus === 0}
              className="inline-flex items-center gap-1 rounded-pill px-2 py-1 text-[10px] font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <CheckCheck className="h-3 w-3" />
              {t('messages.marquer_lu')}
            </button>
          </header>

          <ul className="max-h-[320px] divide-y divide-line/[0.05] overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => {
              const Icone = ICONES[notification.ton];
              return (
                <li key={notification.id}>
                  <Link
                    to={notification.href ?? '/messages'}
                    onClick={() => {
                      marquerLu(notification.id);
                      onFermer();
                    }}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors hover:bg-surface',
                      !notification.lu && 'bg-accent/[0.035]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full',
                        notification.ton === 'success' &&
                          'bg-[#E7F7ED] text-[#15803D] dark:bg-success/15 dark:text-[#86EFAC]',
                        notification.ton === 'accent' && 'bg-accent-soft text-accent-deep',
                        notification.ton === 'warning' &&
                          'bg-[#FDF3E2] text-[#8A5A08] dark:bg-warning/15 dark:text-[#FBBF24]',
                        notification.ton === 'info' &&
                          'bg-[#EAF1FE] text-[#1E4FA8] dark:bg-info/15 dark:text-[#93C5FD]',
                      )}
                    >
                      <Icone aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-semibold text-ink">
                          {notification.titre}
                        </span>
                        {!notification.lu ? (
                          <span
                            aria-label="Non lu"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-ink-soft">
                        {notification.texte}
                      </span>
                      <span className="mt-1 block text-[10px] text-ink-mute">
                        {depuis(notification.date, langue)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-[12px] text-ink-mute">
                {t('notif.vide')}
              </li>
            ) : null}
          </ul>

          <Link
            to="/messages"
            onClick={onFermer}
            className="block border-t border-line/[0.06] px-4 py-3 text-center text-[11px] font-semibold text-accent transition-colors hover:bg-surface"
          >
            {t('notif.voir_tout')}
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
