import type { Role, StatutColis } from '@/api/types';

export interface Ville {
  nom: string;
  code: string;
  lat: number;
  lng: number;
}

export const VILLES: Ville[] = [
  { nom: 'Dakar', code: 'DKR', lat: 14.7167, lng: -17.4677 },
  { nom: 'Thiès', code: 'THS', lat: 14.7886, lng: -16.9246 },
  { nom: 'Saint-Louis', code: 'SLS', lat: 16.0326, lng: -16.4818 },
  { nom: 'Touba', code: 'TBA', lat: 14.85, lng: -15.8833 },
  { nom: 'Mbour', code: 'MBO', lat: 14.4198, lng: -16.9646 },
  { nom: 'Ziguinchor', code: 'ZIG', lat: 12.5833, lng: -16.2719 },
  { nom: 'Kaolack', code: 'KLK', lat: 14.1652, lng: -16.0758 },
  { nom: 'Tambacounda', code: 'TAM', lat: 13.7708, lng: -13.6673 },
  { nom: 'Louga', code: 'LGA', lat: 15.6144, lng: -16.2264 },
  { nom: 'Rufisque', code: 'RFQ', lat: 14.7167, lng: -17.2667 },
  { nom: 'Diourbel', code: 'DRB', lat: 14.6556, lng: -16.2314 },
  { nom: 'Kolda', code: 'KLD', lat: 12.8833, lng: -14.95 },
];

export const VILLES_NOMS = VILLES.map((v) => v.nom);

export function villeParCode(code: string) {
  return VILLES.find((v) => v.code === code);
}

export function villeParNom(nom: string) {
  return VILLES.find((v) => v.nom.toLowerCase() === nom.toLowerCase());
}

export function codeVille(nom: string) {
  return villeParNom(nom)?.code ?? nom.slice(0, 3).toUpperCase();
}

/** Distances routières approximatives depuis Dakar (km). */
export const DISTANCES_DEPUIS_DAKAR: Record<string, number> = {
  Dakar: 0,
  Rufisque: 27,
  Thiès: 70,
  Mbour: 80,
  Diourbel: 154,
  Fatick: 155,
  Kaolack: 192,
  Touba: 195,
  Louga: 203,
  'Saint-Louis': 264,
  Kolda: 383,
  Ziguinchor: 458,
  Tambacounda: 467,
  Matam: 504,
};

export function distanceEntre(depart: string, arrivee: string) {
  const a = DISTANCES_DEPUIS_DAKAR[depart] ?? 120;
  const b = DISTANCES_DEPUIS_DAKAR[arrivee] ?? 150;
  const valeur = Math.abs(a - b);
  return valeur === 0 ? 12 : valeur;
}

export interface StatutMeta {
  /** Clé de traduction : `statut.<statut>` */
  cle: StatutColis;
  ton: 'warning' | 'info' | 'accent' | 'success' | 'danger';
  etape: number;
  /** Part de progression pour les barres. */
  progression: number;
}

export const STATUTS: Record<StatutColis, StatutMeta> = {
  en_attente: { cle: 'en_attente', ton: 'warning', etape: 0, progression: 12 },
  pris_en_charge: { cle: 'pris_en_charge', ton: 'info', etape: 1, progression: 40 },
  en_transit: { cle: 'en_transit', ton: 'accent', etape: 2, progression: 72 },
  livre: { cle: 'livre', ton: 'success', etape: 3, progression: 100 },
  echec: { cle: 'echec', ton: 'danger', etape: 2, progression: 72 },
};

export const STATUTS_LISTE: StatutColis[] = [
  'en_attente',
  'pris_en_charge',
  'en_transit',
  'livre',
  'echec',
];

export const ETAPES_SUIVI = [
  { statut: 'en_attente' as StatutColis, cle: 'etape.enregistre' },
  { statut: 'pris_en_charge' as StatutColis, cle: 'etape.pris_en_charge' },
  { statut: 'en_transit' as StatutColis, cle: 'etape.en_transit' },
  { statut: 'livre' as StatutColis, cle: 'etape.livre' },
];

export const ROLES: Record<Role, { cle: string; ton: 'accent' | 'info' | 'warning' }> = {
  client: { cle: 'role.client', ton: 'accent' },
  livreur: { cle: 'role.livreur', ton: 'info' },
  administrateur: { cle: 'role.administrateur', ton: 'warning' },
};

export interface NavItem {
  to: string;
  cle: string;
  icone: 'dashboard' | 'colis' | 'livraisons' | 'carte' | 'messages' | 'parametres' | 'tournees' | 'admin';
  roles?: Role[];
  badge?: number;
}

export const NAV_PRINCIPALE: NavItem[] = [
  { to: '/dashboard', cle: 'nav.dashboard', icone: 'dashboard' },
  { to: '/colis', cle: 'nav.colis', icone: 'colis' },
  { to: '/livraisons', cle: 'nav.livraisons', icone: 'livraisons' },
  { to: '/carte', cle: 'nav.carte', icone: 'carte' },
  { to: '/messages', cle: 'nav.messages', icone: 'messages', badge: 3 },
  { to: '/parametres', cle: 'nav.parametres', icone: 'parametres' },
];

export const NAV_ESPACE: NavItem[] = [
  { to: '/livreur', cle: 'nav.livreur', icone: 'tournees', roles: ['livreur'] },
  { to: '/admin', cle: 'nav.admin', icone: 'admin', roles: ['administrateur'] },
];

export const FILTRES_STATUT = [
  'tous',
  'en_attente',
  'pris_en_charge',
  'en_transit',
  'livre',
  'echec',
] as const;

export type FiltreStatut = (typeof FILTRES_STATUT)[number];
