import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Map, Phone, Star } from 'lucide-react';
import type { Utilisateur } from '@/api/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { nombre } from '@/lib/format';
import { cn } from '@/lib/cn';

function IllustrationCamion() {
  const reduit = useReducedMotion();
  return (
    <svg
      viewBox="0 0 220 100"
      className="h-full w-full"
      role="img"
      aria-label="Illustration du véhicule de livraison SenTransport"
    >
      <ellipse cx="110" cy="86" rx="82" ry="6" fill="rgba(75,52,184,0.16)" />
      <motion.g
        animate={reduit ? undefined : { y: [0, -2.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M28 64V36a8 8 0 0 1 8-8h72l16 14h44a10 10 0 0 1 10 10v12"
          fill="#fff"
          stroke="#4B34B8"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M124 28h-6v20h10"
          fill="none"
          stroke="#4B34B8"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M126 28h34l12 14h-46Z"
          fill="#E9E4FF"
          stroke="#4B34B8"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <rect x="28" y="52" width="84" height="6" rx="3" fill="#7C5CFC" />
        <rect x="38" y="38" width="26" height="9" rx="2.5" fill="#7C5CFC" opacity="0.28" />
        <rect x="70" y="38" width="16" height="9" rx="2.5" fill="#7C5CFC" opacity="0.16" />
        <path d="M178 54h6v10h-6z" fill="#F59E0B" />
        <circle cx="58" cy="66" r="11" fill="#14121F" />
        <circle cx="58" cy="66" r="4.5" fill="#fff" />
        <circle cx="160" cy="66" r="11" fill="#14121F" />
        <circle cx="160" cy="66" r="4.5" fill="#fff" />
      </motion.g>
      <path
        d="M12 80h14M196 80h12M4 90h20M182 90h28"
        stroke="#7C5CFC"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />
    </svg>
  );
}

export function CourierCard({ livreur }: { livreur: Utilisateur }) {
  const { t, langue } = useI18n();
  const capacite = livreur.capaciteKg ?? 600;
  const charge = Math.round(capacite * 0.42);

  return (
    <section className="surface-card flex h-full flex-col gap-3.5 p-5">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-ink">{t('dash.vehicule')}</h2>
        <Badge ton="success" point taille="sm">
          En tournée
        </Badge>
      </header>

      <div className="relative h-[106px] overflow-hidden rounded-[16px] bg-gradient-to-br from-accent-soft via-[#F2EEFF] to-[#FBF9FF] dark:from-[#2B2450] dark:via-[#241F42] dark:to-[#1E1A36]">
        <div className="absolute inset-0 px-4 pt-1">
          <IllustrationCamion />
        </div>
        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-pill bg-white/85 px-2 py-1 text-[10px] font-semibold text-[#4B34B8] backdrop-blur dark:bg-black/30 dark:text-[#C9BCFF]">
          <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />
          <span className="num">{nombre(livreur.note ?? 4.8, langue, 1)}</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <Avatar prenom={livreur.prenom} nom={livreur.nom} taille="md" enLigne />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">
            {livreur.prenom} {livreur.nom}
          </p>
          <p className="truncate text-[11px] text-ink-mute">
            {livreur.vehicule ?? 'Véhicule utilitaire'} · {livreur.ville}
          </p>
        </div>
        <span className="num rounded-pill bg-shell px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-soft ring-1 ring-line/10 dark:bg-white/[0.04] dark:ring-white/10">
          {livreur.immatriculation ?? 'DK-0000-AA'}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] text-ink-mute">
          <span className="label-caps">{t('dash.capacite')}</span>
          <span className="num font-medium text-ink-soft">
            {nombre(charge, langue)} / {nombre(capacite, langue)} kg
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={charge}
          aria-valuemin={0}
          aria-valuemax={capacite}
          aria-label={t('dash.capacite')}
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-line/[0.08] dark:bg-white/10"
        >
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${(charge / capacite) * 100}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={cn('block h-full rounded-pill bg-accent')}
          />
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <a
          href={`tel:${livreur.telephone.replace(/\s/g, '')}`}
          className={buttonVariants({ variant: 'primary', size: 'sm', className: 'flex-1' })}
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {t('dash.appeler')}
        </a>
        <Link
          to="/carte"
          className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'flex-1' })}
        >
          <Map className="h-3.5 w-3.5" aria-hidden />
          {t('dash.voir_carte')}
        </Link>
      </div>
    </section>
  );
}
