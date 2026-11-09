import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function GlobalErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-lg rounded-shell bg-shell p-8 text-center shadow-shell">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FDECEC] text-danger dark:bg-danger/15">
          <AlertOctagon className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-ink">
          Quelque chose s’est mal passé
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink-soft">
          Une erreur inattendue a interrompu l’affichage. Vous pouvez réessayer ou revenir
          au tableau de bord.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="accent"
            onClick={() => {
              if (onRetry) onRetry();
              else window.location.reload();
            }}
            iconLeft={<RotateCcw className="h-4 w-4" />}
          >
            Recharger la page
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.location.assign('/dashboard');
            }}
          >
            Retour au tableau de bord
          </Button>
        </div>
        <p className="mt-5 text-[10px] text-ink-mute">
          Si le problème persiste, écrivez à support@sentransport.sn.
        </p>
      </div>
    </div>
  );
}
