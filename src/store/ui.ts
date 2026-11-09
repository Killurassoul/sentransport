import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Langue, Theme } from '@/api/types';

export interface NotificationApp {
  id: string;
  titre: string;
  texte: string;
  date: string;
  lu: boolean;
  ton: 'accent' | 'success' | 'warning' | 'info';
  href?: string;
}

interface UIState {
  theme: Theme;
  langue: Langue;
  sidebarMobile: boolean;
  paletteOuverte: boolean;
  notificationsOuvertes: boolean;
  notifications: NotificationApp[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLangue: (langue: Langue) => void;
  setSidebarMobile: (ouvert: boolean) => void;
  setPaletteOuverte: (ouvert: boolean) => void;
  setNotificationsOuvertes: (ouvert: boolean) => void;
  marquerLu: (id: string) => void;
  marquerToutLu: () => void;
  ajouterNotification: (notification: Omit<NotificationApp, 'id' | 'date' | 'lu'>) => void;
}

const ilYA = (heures: number) =>
  new Date(Date.now() - heures * 3600_000).toISOString();

const notificationsInitiales: NotificationApp[] = [
  {
    id: 'n1',
    titre: 'Colis ST-2026-00417 en transit',
    texte: 'Votre colis a quitté le hub de Dakar en direction de Thiès.',
    date: ilYA(0.4),
    lu: false,
    ton: 'accent',
    href: '/colis/ST-2026-00417',
  },
  {
    id: 'n2',
    titre: 'Livraison confirmée',
    texte: 'ST-2026-00402 a été remis à Fatou Ndiaye à Mbour.',
    date: ilYA(3),
    lu: false,
    ton: 'success',
    href: '/colis',
  },
  {
    id: 'n3',
    titre: 'Tournée modifiée',
    texte: 'Modou Fall a récupéré 3 nouveaux colis pour la tournée de l’après-midi.',
    date: ilYA(6),
    lu: false,
    ton: 'info',
    href: '/livraisons',
  },
  {
    id: 'n4',
    titre: 'Échec de livraison',
    texte: 'ST-2026-00388 : destinataire absent à Saint-Louis. Nouvelle tentative prévue.',
    date: ilYA(26),
    lu: true,
    ton: 'warning',
    href: '/colis',
  },
];

function appliquerTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0F0D1A' : '#D9D3F5');
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      langue: 'fr',
      sidebarMobile: false,
      paletteOuverte: false,
      notificationsOuvertes: false,
      notifications: notificationsInitiales,
      setTheme: (theme) => {
        appliquerTheme(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
      setLangue: (langue) => set({ langue }),
      setSidebarMobile: (sidebarMobile) => set({ sidebarMobile }),
      setPaletteOuverte: (paletteOuverte) => set({ paletteOuverte }),
      setNotificationsOuvertes: (notificationsOuvertes) =>
        set({ notificationsOuvertes }),
      marquerLu: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, lu: true } : n,
          ),
        })),
      marquerToutLu: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, lu: true })),
        })),
      ajouterNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `n-${Date.now()}`,
              date: new Date().toISOString(),
              lu: false,
            },
            ...state.notifications,
          ].slice(0, 40),
        })),
    }),
    {
      name: 'st.ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        langue: state.langue,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) appliquerTheme(state.theme);
      },
    },
  ),
);

/** Initialise le thème avant le premier rendu (évite un flash clair). */
export function initialiserTheme() {
  const stocke = useUIStore.getState().theme;
  const systeme = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  const theme = stocke ?? systeme;
  appliquerTheme(theme);
  if (theme !== stocke) useUIStore.getState().setTheme(theme);
}
