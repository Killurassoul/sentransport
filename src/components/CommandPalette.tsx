import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CornerDownLeft,
  LogOut,
  Map,
  Moon,
  Package,
  Plus,
  Search,
  Sun,
} from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/hooks/useI18n';
import { useColisList } from '@/api/hooks/colis';
import { NAV_PRINCIPALE } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface Commande {
  id: string;
  groupe: 'navigation' | 'colis' | 'actions';
  titre: string;
  sousTitre?: string;
  icone: React.ReactNode;
  raccourci?: string;
  executer: () => void;
}

export function CommandPalette() {
  const { t, langue } = useI18n();
  const navigate = useNavigate();
  const ouverte = useUIStore((s) => s.paletteOuverte);
  const setOuverte = useUIStore((s) => s.setPaletteOuverte);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const logout = useAuthStore((s) => s.logout);
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const [recherche, setRecherche] = useState('');
  const [actif, setActif] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);

  const { data } = useColisList({ limit: 50 });
  const colis = useMemo(() => data?.items ?? [], [data]);

  const fermer = useCallback(() => {
    setOuverte(false);
    setRecherche('');
  }, [setOuverte, setRecherche]);

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if ((evenement.metaKey || evenement.ctrlKey) && evenement.key.toLowerCase() === 'k') {
        evenement.preventDefault();
        setOuverte(!ouverte);
      }
      if (evenement.key === 'Escape' && ouverte) {
        evenement.preventDefault();
        fermer();
      }
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  });

  useEffect(() => {
    if (ouverte) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      document.body.style.overflow = 'hidden';
      return () => {
        window.clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [ouverte]);

  const commandes = useMemo<Commande[]>(() => {
    const pages: Commande[] = NAV_PRINCIPALE.map((item) => ({
      id: `page-${item.to}`,
      groupe: 'navigation' as const,
      titre: t(item.cle as 'nav.dashboard'),
      sousTitre: item.to,
      icone: <ArrowRight className="h-4 w-4" />,
      executer: () => {
        fermer();
        navigate(item.to);
      },
    }));
    if (utilisateur?.role === 'livreur') {
      pages.push({
        id: 'page-livreur',
        groupe: 'navigation',
        titre: t('nav.livreur'),
        sousTitre: '/livreur',
        icone: <ArrowRight className="h-4 w-4" />,
        executer: () => {
          fermer();
          navigate('/livreur');
        },
      });
    }
    if (utilisateur?.role === 'administrateur') {
      pages.push({
        id: 'page-admin',
        groupe: 'navigation',
        titre: t('nav.admin'),
        sousTitre: '/admin',
        icone: <ArrowRight className="h-4 w-4" />,
        executer: () => {
          fermer();
          navigate('/admin');
        },
      });
    }

    const resultatsColis: Commande[] = colis.slice(0, 30).map((c) => ({
      id: `colis-${c.id}`,
      groupe: 'colis' as const,
      titre: c.numeroSuivi,
      sousTitre: `${c.destinataire.nom} · ${c.villeDepart} → ${c.villeArrivee}`,
      icone: <Package className="h-4 w-4" />,
      executer: () => {
        fermer();
        navigate(`/colis/${c.numeroSuivi}`);
      },
    }));

    const actions: Commande[] = [
      {
        id: 'action-nouveau',
        groupe: 'actions',
        titre: t('cmd.nouveau'),
        icone: <Plus className="h-4 w-4" />,
        raccourci: 'N',
        executer: () => {
          fermer();
          navigate('/colis/nouveau');
        },
      },
      {
        id: 'action-theme',
        groupe: 'actions',
        titre: t('cmd.theme'),
        sousTitre: theme === 'dark' ? t('commun.light') : t('commun.dark'),
        icone:
          theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        raccourci: 'T',
        executer: () => {
          toggleTheme();
        },
      },
      {
        id: 'action-carte',
        groupe: 'actions',
        titre: t('cmd.carte'),
        icone: <Map className="h-4 w-4" />,
        executer: () => {
          fermer();
          navigate('/carte');
        },
      },
      {
        id: 'action-deconnexion',
        groupe: 'actions',
        titre: t('cmd.deconnexion'),
        icone: <LogOut className="h-4 w-4" />,
        executer: () => {
          logout();
          fermer();
          navigate('/login');
        },
      },
    ];

    return [...pages, ...resultatsColis, ...actions];
  }, [
    t,
    colis,
    navigate,
    theme,
    toggleTheme,
    utilisateur?.role,
    logout,
    fermer,
  ]);

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return commandes;
    return commandes.filter((commande) =>
      `${commande.titre} ${commande.sousTitre ?? ''}`.toLowerCase().includes(q),
    );
  }, [commandes, recherche]);

  useEffect(() => {
    setActif(0);
  }, [recherche, ouverte]);

  const executer = (index: number) => {
    const commande = filtrees[index];
    commande?.executer();
  };

  const surClavier = (evenement: React.KeyboardEvent) => {
    if (evenement.key === 'ArrowDown') {
      evenement.preventDefault();
      setActif((i) => Math.min(filtrees.length - 1, i + 1));
    } else if (evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      setActif((i) => Math.max(0, i - 1));
    } else if (evenement.key === 'Enter') {
      evenement.preventDefault();
      executer(actif);
    }
  };

  useEffect(() => {
    const element = listeRef.current?.querySelector<HTMLElement>(`[data-index="${actif}"]`);
    element?.scrollIntoView({ block: 'nearest' });
  }, [actif]);

  return createPortal(
    <AnimatePresence>
      {ouverte ? (
        <div className="fixed inset-0 z-[140] flex items-start justify-center px-4 pt-[12vh]">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Fermer la palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fermer}
            className="absolute inset-0 cursor-default bg-[#14121F]/45 backdrop-blur-[3px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
            className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[22px] border border-line/10 bg-shell shadow-pop"
          >
            <div className="flex items-center gap-3 border-b border-line/[0.07] px-4 py-3.5">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-ink-mute" />
              <input
                ref={inputRef}
                value={recherche}
                onChange={(evenement) => setRecherche(evenement.target.value)}
                onKeyDown={surClavier}
                placeholder={t('cmd.placeholder')}
                aria-label={t('cmd.placeholder')}
                autoComplete="off"
                className="h-6 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
              />
              <kbd className="hidden shrink-0 rounded-md border border-line/10 bg-surface px-1.5 py-0.5 text-[9px] font-medium text-ink-mute sm:block">
                ESC
              </kbd>
            </div>

            <ul
              ref={listeRef}
              role="listbox"
              aria-label="Commandes"
              className="max-h-[min(56vh,420px)] overflow-y-auto p-2"
            >
              {filtrees.length === 0 ? (
                <li className="px-3 py-10 text-center text-sm text-ink-mute">
                  {t('cmd.aucun')}
                </li>
              ) : null}

              {(['navigation', 'colis', 'actions'] as const).map((groupe) => {
                const elements = filtrees.filter((c) => c.groupe === groupe);
                if (elements.length === 0) return null;
                return (
                  <li key={groupe} className="mb-1">
                    <p className="label-caps px-2.5 pb-1 pt-2">
                      {groupe === 'navigation'
                        ? t('cmd.pages')
                        : groupe === 'colis'
                          ? t('cmd.colis')
                          : t('cmd.actions')}
                    </p>
                    <ul>
                      {elements.map((commande) => {
                        const index = filtrees.indexOf(commande);
                        const selectionne = index === actif;
                        return (
                          <li key={commande.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selectionne}
                              data-index={index}
                              onMouseEnter={() => setActif(index)}
                              onClick={() => executer(index)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors',
                                selectionne ? 'bg-accent-soft' : 'hover:bg-surface',
                              )}
                            >
                              <span
                                className={cn(
                                  'grid h-8 w-8 shrink-0 place-items-center rounded-[10px]',
                                  selectionne
                                    ? 'bg-accent text-white'
                                    : 'bg-surface text-ink-soft',
                                )}
                              >
                                {commande.icone}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-medium text-ink">
                                  {commande.titre}
                                </span>
                                {commande.sousTitre ? (
                                  <span className="block truncate text-[10.5px] text-ink-mute">
                                    {commande.sousTitre}
                                  </span>
                                ) : null}
                              </span>
                              {commande.raccourci ? (
                                <kbd className="rounded border border-line/10 px-1.5 py-0.5 text-[9px] text-ink-mute">
                                  {commande.raccourci}
                                </kbd>
                              ) : selectionne ? (
                                <CornerDownLeft className="h-3.5 w-3.5 text-accent" />
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <footer className="flex items-center justify-between border-t border-line/[0.07] px-4 py-2.5 text-[10px] text-ink-mute">
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-line/10 px-1 py-0.5">↑</kbd>
                <kbd className="rounded border border-line/10 px-1 py-0.5">↓</kbd>
                {langue === 'fr' ? 'pour naviguer' : 'to navigate'}
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-line/10 px-1 py-0.5">↵</kbd>
                {langue === 'fr' ? 'pour ouvrir' : 'to open'}
              </span>
            </footer>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
