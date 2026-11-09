import { Link } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/store/auth';

export function ForbiddenPage() {
  const { t } = useI18n();
  const utilisateur = useAuthStore((s) => s.utilisateur);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-md rounded-card border border-line/[0.06] bg-surface p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEC] text-danger dark:bg-danger/15">
          <Lock className="h-6 w-6" />
        </span>
        <p className="num mt-4 text-[13px] font-semibold tracking-[0.2em] text-ink-mute">
          403
        </p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink">
          {t('erreur.403.titre')}
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
          {t('erreur.403.texte')}
          {utilisateur ? (
            <>
              {' '}
              Votre rôle actuel est{' '}
              <span className="font-semibold text-ink">
                {t(`role.${utilisateur.role}`)}
              </span>
              .
            </>
          ) : null}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/dashboard"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            {t('erreur.retour_dashboard')}
          </Link>
          <Link
            to="/suivi"
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            {t('suivi.titre')}
          </Link>
        </div>
      </div>
    </div>
  );
}
