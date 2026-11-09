import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Role, Utilisateur } from '@/api/types';

interface AuthState {
  token: string | null;
  utilisateur: Utilisateur | null;
  /** Renseigné quand la session expire pour afficher un message sur /login. */
  motifExpiration: string | null;
  setSession: (token: string, utilisateur: Utilisateur) => void;
  setUtilisateur: (utilisateur: Utilisateur) => void;
  logout: (motif?: string) => void;
  aRole: (roles?: Role[]) => boolean;
}

/**
 * Le jeton vit en mémoire (état Zustand) et dans sessionStorage pour survivre
 * à un rafraîchissement de l'onglet. Rien n'est écrit en clair dans le code.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      utilisateur: null,
      motifExpiration: null,
      setSession: (token, utilisateur) =>
        set({ token, utilisateur, motifExpiration: null }),
      setUtilisateur: (utilisateur) => set({ utilisateur }),
      logout: (motif) => set({ token: null, utilisateur: null, motifExpiration: motif ?? null }),
      aRole: (roles) => {
        if (!roles || roles.length === 0) return true;
        const role = get().utilisateur?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name: 'st.session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        token: state.token,
        utilisateur: state.utilisateur,
      }),
    },
  ),
);

/** Lecture hors composant (intercepteurs Axios). */
export const lireToken = () => useAuthStore.getState().token;
