/**
 * Contrat d'API typé — SenTransport.
 * Toutes les routes passent par la passerelle Nginx sous `/api`.
 */

export type Role = 'client' | 'livreur' | 'administrateur';

export type StatutColis =
  | 'en_attente'
  | 'pris_en_charge'
  | 'en_transit'
  | 'livre'
  | 'echec';

export type StatutLivraison = Extract<
  StatutColis,
  'en_attente' | 'en_transit' | 'livre' | 'echec'
>;

export type Theme = 'light' | 'dark';
export type Langue = 'fr' | 'en';

export interface PointGeo {
  lat: number;
  lng: number;
}

export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: Role;
  ville: string;
  actif: boolean;
  createdAt: string;
  /** `/api/users/...` ne stocke aucune image : initiales + teinte calculées côté client. */
  avatarUrl?: string;
  /** Champs renseignés pour les comptes livreurs. */
  vehicule?: string;
  immatriculation?: string;
  capaciteKg?: number;
  note?: number;
}

export interface Adresse {
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  coordonnees?: PointGeo;
}

export interface EvenementSuivi {
  id: string;
  statut: StatutColis;
  libelle: string;
  lieu: string;
  date: string;
  acteur?: string;
}

export interface Colis {
  id: string;
  numeroSuivi: string;
  /** Propriétaire du colis (permet le cloisonnement par rôle côté API). */
  clientId: string;
  expediteur: Adresse;
  destinataire: Adresse;
  description: string;
  poidsKg: number;
  statut: StatutColis;
  villeDepart: string;
  villeArrivee: string;
  distanceKm: number;
  dateCreation: string;
  dateLivraisonPrevue: string;
  dateLivraison?: string;
  prixFcfa: number;
  livreurId?: string;
  historique: EvenementSuivi[];
}

export interface Livraison {
  id: string;
  colisId: string;
  numeroSuivi: string;
  livreurId: string;
  statut: StatutLivraison;
  dateAffectation: string;
  dateLivraison?: string;
  motifEchec?: string;
  tournee: string;
}

export interface Tournee {
  id: string;
  libelle: string;
  date: string;
  livreurId: string;
  zones: string[];
  colisIds: string[];
}

/* ------------------------------------------------------------------------- */
/* Payloads                                                                   */
/* ------------------------------------------------------------------------- */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  password: string;
  role: Extract<Role, 'client' | 'livreur'>;
}

export interface AuthResponse {
  token: string;
  utilisateur: Utilisateur;
}

export interface CreateColisPayload {
  expediteur: Adresse;
  destinataire: Adresse;
  description: string;
  poidsKg: number;
  villeDepart: string;
  villeArrivee: string;
  dateLivraisonPrevue: string;
}

export type UpdateColisPayload = Partial<
  Pick<
    Colis,
    | 'description'
    | 'poidsKg'
    | 'destinataire'
    | 'expediteur'
    | 'dateLivraisonPrevue'
    | 'statut'
  >
>;

export interface UpdateStatutPayload {
  statut: StatutLivraison;
  motifEchec?: string;
  lieu?: string;
}

export interface AffectationPayload {
  colisId: string;
  livreurId: string;
}

export interface ColisListParams {
  page?: number;
  limit?: number;
  q?: string;
  statut?: StatutColis | 'tous';
  ville?: string;
  livreurId?: string;
  tri?: 'recent' | 'ancien' | 'poids' | 'numero';
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface ApiErreur {
  message: string;
  code?: string;
  details?: Record<string, string>;
}
