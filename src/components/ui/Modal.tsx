import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

const TAILLES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  titre: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  taille?: keyof typeof TAILLES;
  fermerAuClicExterieur?: boolean;
}

const FOCUSABLES =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  titre,
  description,
  children,
  footer,
  taille = 'md',
  fermerAuClicExterieur = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titreId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const elementPrecedent = document.activeElement as HTMLElement | null;
    const overflowPrecedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focus = window.setTimeout(() => panelRef.current?.focus(), 30);

    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        evenement.preventDefault();
        onCloseRef.current();
        return;
      }
      if (evenement.key !== 'Tab' || !panelRef.current) return;
      const elements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLES),
      ).filter((el) => el.offsetParent !== null);
      if (elements.length === 0) return;
      const premier = elements[0] as HTMLElement;
      const dernier = elements[elements.length - 1] as HTMLElement;
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener('keydown', surTouche);
    return () => {
      window.clearTimeout(focus);
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = overflowPrecedent;
      elementPrecedent?.focus?.();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Fermer la fenêtre"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={fermerAuClicExterieur ? onClose : undefined}
            className="absolute inset-0 cursor-default bg-[#14121F]/45 backdrop-blur-[3px]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titreId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[26px] bg-shell shadow-pop outline-none sm:rounded-[26px]',
              TAILLES[taille],
            )}
          >
            <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
              <div>
                <h2 id={titreId} className="text-lg font-semibold text-ink">
                  {titre}
                </h2>
                {description ? (
                  <p id={descriptionId} className="mt-1 text-sm text-ink-soft">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
            {footer ? (
              <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line/[0.06] px-6 py-4">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
