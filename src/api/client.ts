import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiErreur } from './types';
import { useAuthStore } from '@/store/auth';

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, string>;

  constructor(message: string, options?: { status?: number; code?: string; details?: Record<string, string> }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

/* ------------------------------------------------------------------ */
/* Jeton JWT                                                          */
/* ------------------------------------------------------------------ */

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
});

/* ------------------------------------------------------------------ */
/* 401 — déconnexion propre + redirection avec retour à la page       */
/* ------------------------------------------------------------------ */

type Gestionnaire401 = (redirection: string) => void;
const gestionnaires401 = new Set<Gestionnaire401>();

export function surExpirationSession(gestionnaire: Gestionnaire401) {
  gestionnaires401.add(gestionnaire);
  return () => gestionnaires401.delete(gestionnaire);
}

const ROUTES_PUBLIQUES = ['/users/login', '/users/register', '/colis/suivi'];

function estRoutePublique(url?: string) {
  if (!url) return false;
  return ROUTES_PUBLIQUES.some((route) => url.includes(route));
}

/* ------------------------------------------------------------------ */
/* Normalisation des erreurs                                          */
/* ------------------------------------------------------------------ */

export function normaliserErreur(erreur: unknown): ApiError {
  if (erreur instanceof ApiError) return erreur;

  if (axios.isAxiosError(erreur)) {
    const axErr = erreur as AxiosError<ApiErreur>;
    if (axErr.code === 'ECONNABORTED' || axErr.code === 'ETIMEDOUT') {
      return new ApiError(
        'Le serveur met trop de temps à répondre. Vérifiez votre connexion puis réessayez.',
        { code: 'timeout' },
      );
    }
    if (!axErr.response) {
      return new ApiError(
        'Connexion impossible. Vérifiez votre connexion réseau puis réessayez.',
        { code: 'reseau' },
      );
    }
    const status = axErr.response.status;
    const donnees = axErr.response.data;
    const message =
      (typeof donnees === 'object' && donnees?.message) ||
      messageParStatut(status) ||
      'Une erreur est survenue.';
    return new ApiError(message, {
      status,
      code: donnees?.code,
      details: donnees?.details,
    });
  }

  if (erreur instanceof Error) return new ApiError(erreur.message);
  return new ApiError('Une erreur inattendue est survenue.');
}

function messageParStatut(status: number) {
  switch (status) {
    case 400:
      return 'Les informations envoyées sont incomplètes ou invalides.';
    case 401:
      return 'Votre session a expiré. Reconnectez-vous.';
    case 403:
      return 'Vous n’avez pas les droits nécessaires pour cette action.';
    case 404:
      return 'La ressource demandée est introuvable.';
    case 409:
      return 'Cette action entre en conflit avec une donnée existante.';
    case 429:
      return 'Trop de requêtes. Patientez un instant puis réessayez.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Le service est momentanément indisponible. Réessayez dans quelques instants.';
    default:
      return '';
  }
}

api.interceptors.response.use(
  (reponse) => reponse,
  (erreur: unknown) => {
    if (axios.isAxiosError(erreur) && erreur.response?.status === 401) {
      const url = erreur.config?.url;
      if (!estRoutePublique(url)) {
        const chemin = `${window.location.pathname}${window.location.search}`;
        useAuthStore.getState().logout('Votre session a expiré. Reconnectez-vous.');
        gestionnaires401.forEach((gestionnaire) =>
          gestionnaire(chemin === '/login' ? '/' : chemin),
        );
      }
    }
    return Promise.reject(normaliserErreur(erreur));
  },
);

/** Utilitaire de test : remet les abonnements 401 à zéro. */
export function reinitialiserGestionnaires401() {
  gestionnaires401.clear();
}
