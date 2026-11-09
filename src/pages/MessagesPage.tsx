import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCheck,
  ChevronRight,
  Mail,
  PackageCheck,
  Truck,
  TriangleAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore, type NotificationApp } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { depuis } from '@/lib/format';
import { cn } from '@/lib/cn';

const ICONES = {
  accent: Truck,
  success: PackageCheck,
  warning: TriangleAlert,
  info: Truck,
} as const;

const TONS: Record<NotificationApp['ton'], string> = {
  accent: 'bg-accent-soft text-accent-deep',
  success: 'bg-[#E7F7ED] text-[#15803D] dark:bg-success/15 dark:text-[#86EFAC]',
  warning: 'bg-[#FDF3E2] text-[#8A5A08] dark:bg-warning/15 dark:text-[#FBBF24]',
  info: 'bg-[#EAF1FE] text-[#1E4FA8] dark:bg-info/15 dark:text-[#93C5FD]',
};

export function MessagesPage() {
  const { t, langue } = useI18n();
  const navigate = useNavigate();
  const notifications = useUIStore((s) => s.notifications);
  const marquerLu = useUIStore((s) => s.marquerLu);
  const marquerToutLu = useUIStore((s) => s.marquerToutLu);
  const [filtre, setFiltre] = useState<'toutes' | 'non_lues'>('toutes');

  const nonLus = notifications.filter((n) => !n.lu).length;
  const liste = useMemo(
    () => (filtre === 'toutes' ? notifications : notifications.filter((n) => !n.lu)),
    [notifications, filtre],
  );

  const groupes = useMemo(() => {
    const aujourdhui = new Date().toDateString();
    const estAujourdhui = (notification: NotificationApp) =>
      new Date(notification.date).toDateString() === aujourdhui;
    return [
      { titre: t('messages.aujourdhui'), items: liste.filter(estAujourdhui) },
      { titre: t('messages.plus_tot'), items: liste.filter((n) => !estAujourdhui(n)) },
    ].filter((groupe) => groupe.items.length > 0);
  }, [liste, t]);

  const ouvrir = (notification: NotificationApp) => {
    marquerLu(notification.id);
    if (notification.href) navigate(notification.href);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <section className="surface-card overflow-hidden xl:col-span-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/[0.06] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-ink">{t('messages.titre')}</h2>
              {nonLus > 0 ? (
                <Badge ton="accent" taille="sm">
                  {t('messages.non_lus', { n: nonLus })}
                </Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-[10.5px] text-ink-mute">
              Suivez les événements de vos colis et de vos tournées.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SegmentedControl
              ariaLabel="Filtrer les notifications"
              value={filtre}
              onChange={setFiltre}
              options={[
                { value: 'toutes', label: t('commun.tous') },
                { value: 'non_lues', label: t('messages.non_lus', { n: nonLus }) },
              ]}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={marquerToutLu}
              disabled={nonLus === 0}
              iconLeft={<CheckCheck className="h-3.5 w-3.5" />}
            >
              <span className="hidden sm:inline">{t('messages.marquer_lu')}</span>
            </Button>
          </div>
        </header>

        {liste.length === 0 ? (
          <EmptyState
            titre={t('messages.vide')}
            texte="Les notifications de livraison, d’affectation et d’échec apparaîtront ici."
            variante="messages"
          />
        ) : (
          <div>
            {groupes.map((groupe) => (
              <div key={groupe.titre}>
                <p className="label-caps px-5 pb-1 pt-4">{groupe.titre}</p>
                <ul className="divide-y divide-line/[0.05]">
                  {groupe.items.map((notification, index) => {
                    const Icone = ICONES[notification.ton];
                    return (
                      <motion.li
                        key={notification.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                      >
                        <button
                          type="button"
                          onClick={() => ouvrir(notification)}
                          className={cn(
                            'flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                            notification.lu ? 'hover:bg-surface/70' : 'bg-accent/[0.035] hover:bg-accent/[0.06]',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full',
                              TONS[notification.ton],
                            )}
                          >
                            <Icone aria-hidden className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[12.5px] font-semibold text-ink">
                                {notification.titre}
                              </span>
                              {!notification.lu ? (
                                <span className="rounded-pill bg-accent px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                                  Nouveau
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">
                              {notification.texte}
                            </span>
                            <span className="mt-1 block text-[10px] text-ink-mute">
                              {depuis(notification.date, langue)}
                            </span>
                          </span>
                          <ChevronRight
                            aria-hidden
                            className="mt-2 h-4 w-4 shrink-0 text-ink-mute"
                          />
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-4 xl:col-span-4">
        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-ink">Canaux de notification</h2>
          <p className="mt-0.5 text-[10.5px] text-ink-mute">
            Les alertes essentielles sont toujours envoyées par e-mail.
          </p>
          <ul className="mt-3 space-y-2">
            {[
              { libelle: 'E-mail transactionnel', detail: 'Création, transit, livraison' },
              { libelle: 'SMS livreur', detail: 'Affectation et changement de tournée' },
              { libelle: 'Centre de notifications', detail: 'Toutes les alertes du compte' },
            ].map((canal) => (
              <li
                key={canal.libelle}
                className="flex items-start gap-2.5 rounded-[12px] bg-shell/60 px-3 py-2.5 dark:bg-white/[0.03]"
              >
                <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-accent-soft text-accent-deep">
                  <Mail aria-hidden className="h-3 w-3" />
                </span>
                <span>
                  <span className="block text-[11.5px] font-medium text-ink">
                    {canal.libelle}
                  </span>
                  <span className="block text-[10px] text-ink-mute">{canal.detail}</span>
                </span>
                <span className="ml-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-success" />
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-[14px] font-semibold text-ink">Support SenTransport</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
            Une question sur une livraison ? Notre équipe basée à Dakar répond du lundi au
            samedi, de 8 h à 19 h.
          </p>
          <a
            href="mailto:support@sentransport.sn"
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-pill bg-[#111018] px-3.5 text-[11.5px] font-medium text-white transition-colors hover:bg-[#1E1B2B] dark:bg-[#F4F2FF] dark:text-[#14121F]"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            support@sentransport.sn
          </a>
        </section>
      </aside>
    </div>
  );
}
