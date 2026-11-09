import type {
  Adresse,
  Colis,
  EvenementSuivi,
  Livraison,
  StatutColis,
  Tournee,
  Utilisateur,
} from '@/api/types';
import { distanceEntre, villeParNom } from '@/lib/constants';

const MAINTENANT = Date.now();
const H = 3600_000;
const J = 24 * H;

/** ISO relatif à maintenant (heures négatives = passé). */
const h = (heures: number) => new Date(MAINTENANT + heures * H).toISOString();
const j = (jours: number) => h(jours * 24);

function adresse(
  nom: string,
  telephone: string,
  rue: string,
  ville: string,
  decalage = 0,
): Adresse {
  const centre = villeParNom(ville) ?? { lat: 14.7, lng: -17.4 };
  return {
    nom,
    telephone,
    adresse: rue,
    ville,
    coordonnees: {
      lat: centre.lat + decalage * 0.0043,
      lng: centre.lng + decalage * 0.0051,
    },
  };
}

export const UTILISATEURS: Utilisateur[] = [
  {
    id: 'u1',
    prenom: 'Awa',
    nom: 'Diop',
    email: 'awa.diop@sentransport.sn',
    telephone: '+221 77 512 40 18',
    role: 'client',
    ville: 'Dakar',
    actif: true,
    createdAt: j(-320),
  },
  {
    id: 'u2',
    prenom: 'Cheikh',
    nom: 'Ndiaye',
    email: 'cheikh.ndiaye@boutique-teranga.sn',
    telephone: '+221 76 304 22 90',
    role: 'client',
    ville: 'Thiès',
    actif: true,
    createdAt: j(-210),
  },
  {
    id: 'u3',
    prenom: 'Fatou',
    nom: 'Sow',
    email: 'fatou.sow@atelierminam.sn',
    telephone: '+221 78 118 55 07',
    role: 'client',
    ville: 'Saint-Louis',
    actif: true,
    createdAt: j(-180),
  },
  {
    id: 'u4',
    prenom: 'Modou',
    nom: 'Fall',
    email: 'modou.fall@sentransport.sn',
    telephone: '+221 77 903 12 45',
    role: 'livreur',
    ville: 'Dakar',
    actif: true,
    createdAt: j(-400),
    vehicule: 'Renault Kangoo ZE',
    immatriculation: 'DK-4821-AB',
    capaciteKg: 650,
    note: 4.9,
  },
  {
    id: 'u5',
    prenom: 'Aminata',
    nom: 'Ba',
    email: 'aminata.ba@sentransport.sn',
    telephone: '+221 76 220 88 31',
    role: 'livreur',
    ville: 'Thiès',
    actif: true,
    createdAt: j(-260),
    vehicule: 'Peugeot Partner',
    immatriculation: 'TH-1190-CD',
    capaciteKg: 800,
    note: 4.7,
  },
  {
    id: 'u6',
    prenom: 'Ibrahima',
    nom: 'Sarr',
    email: 'ibrahima.sarr@sentransport.sn',
    telephone: '+221 78 640 71 22',
    role: 'livreur',
    ville: 'Dakar',
    actif: false,
    createdAt: j(-150),
    vehicule: 'Toyota Hilux',
    immatriculation: 'DK-7730-EF',
    capaciteKg: 1200,
    note: 4.5,
  },
  {
    id: 'u7',
    prenom: 'Abdoulaye',
    nom: 'Mbaye',
    email: 'admin@sentransport.sn',
    telephone: '+221 77 400 60 60',
    role: 'administrateur',
    ville: 'Dakar',
    actif: true,
    createdAt: j(-700),
  },
];

export const MOT_DE_PASSE_DEMO = 'Demo1234!';

interface DefinitionColis {
  numeroSuivi: string;
  clientId: string;
  expediteur: Adresse;
  destinataire: Adresse;
  description: string;
  poidsKg: number;
  statut: StatutColis;
  livreurId?: string;
  creationHeures: number;
  prevuHeures: number;
  livreHeures?: number;
  motifEchec?: string;
}

function evenementsPour(def: DefinitionColis, id: string): EvenementSuivi[] {
  const base = MAINTENANT + def.creationHeures * H;
  const evenements: EvenementSuivi[] = [
    {
      id: `${id}-e1`,
      statut: 'en_attente',
      libelle: 'Colis enregistré au guichet',
      lieu: def.expediteur.ville,
      date: new Date(base).toISOString(),
      acteur: 'Guichet SenTransport',
    },
  ];
  const etapes: StatutColis[] = ['pris_en_charge', 'en_transit', 'livre'];
  const cible = def.statut === 'echec' ? 2 : etapes.indexOf(def.statut) + 1;
  const textes: Record<string, { libelle: string; lieu: string; acteur: string }> = {
    pris_en_charge: {
      libelle: 'Pris en charge par le livreur',
      lieu: def.expediteur.ville,
      acteur: 'Centre de tri',
    },
    en_transit: {
      libelle: `En transit vers ${def.destinataire.ville}`,
      lieu: `${def.expediteur.ville} → ${def.destinataire.ville}`,
      acteur: 'Hub logistique',
    },
    livre: {
      libelle: `Colis remis à ${def.destinataire.nom}`,
      lieu: def.destinataire.ville,
      acteur: 'Preuve de livraison',
    },
  };
  for (let i = 0; i < cible; i += 1) {
    const statut = etapes[i];
    if (!statut) continue;
    const info = textes[statut];
    evenements.push({
      id: `${id}-e${i + 2}`,
      statut,
      libelle: info.libelle,
      lieu: info.lieu,
      date: new Date(base + (i + 1) * 9 * H).toISOString(),
      acteur: info.acteur,
    });
  }
  if (def.statut === 'echec') {
    evenements.push({
      id: `${id}-echec`,
      statut: 'echec',
      libelle: `Échec de livraison — ${def.motifEchec ?? 'destinataire absent'}`,
      lieu: def.destinataire.ville,
      date: new Date(base + 30 * H).toISOString(),
      acteur: 'Livreur',
    });
  }
  evenements.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  if (def.livreHeures) {
    const dernier = evenements[evenements.length - 1];
    if (dernier && dernier.statut === 'livre') {
      dernier.date = new Date(MAINTENANT + def.livreHeures * H).toISOString();
    }
  }
  return evenements;
}

const DEFINITIONS: DefinitionColis[] = [
  {
    numeroSuivi: 'ST-2026-00417',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse('Mariama Diallo', '+221 77 842 19 06', 'Cité Lamy, rue 12', 'Thiès', 2),
    description: 'Documents notariés sous enveloppe renforcée',
    poidsKg: 2.4,
    statut: 'en_transit',
    livreurId: 'u4',
    creationHeures: -30,
    prevuHeures: 18,
  },
  {
    numeroSuivi: 'ST-2026-00416',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Ousmane Kane',
      '+221 76 651 34 77',
      'Quartier Balacoss, face station Total',
      'Saint-Louis',
      3,
    ),
    description: 'Pièces détachées moto — carton de 4 références',
    poidsKg: 12.8,
    statut: 'en_transit',
    livreurId: 'u4',
    creationHeures: -52,
    prevuHeures: 26,
  },
  {
    numeroSuivi: 'ST-2026-00415',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Aïssatou Sy',
      '+221 78 220 64 51',
      'Mbour Sérère, derrière la mosquée',
      'Mbour',
      4,
    ),
    description: 'Cosmétiques naturels — 24 flacons',
    poidsKg: 1.6,
    statut: 'livre',
    livreurId: 'u4',
    creationHeures: -74,
    prevuHeures: -26,
    livreHeures: -30,
  },
  {
    numeroSuivi: 'ST-2026-00410',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Ibrahima Ndiaye',
      '+221 77 019 88 42',
      'Quartier Darou Khoudoss, lot 88',
      'Touba',
      5,
    ),
    description: 'Textiles brodés — 3 ballots',
    poidsKg: 8.2,
    statut: 'en_attente',
    creationHeures: -28,
    prevuHeures: 36,
  },
  {
    numeroSuivi: 'ST-2026-00408',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Khady Sarr',
      '+221 76 733 10 25',
      'Quartier Escale, rue de la Corniche',
      'Ziguinchor',
      6,
    ),
    description: 'Matériel informatique — 2 écrans, 1 mini-PC',
    poidsKg: 5.4,
    statut: 'pris_en_charge',
    livreurId: 'u5',
    creationHeures: -20,
    prevuHeures: 48,
  },
  {
    numeroSuivi: 'ST-2026-00405',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Moussa Bâ',
      '+221 77 660 74 12',
      'Quartier Ndorong, près du marché central',
      'Kaolack',
      7,
    ),
    description: 'Produits pharmaceutiques sous chaîne du froid',
    poidsKg: 3.1,
    statut: 'livre',
    livreurId: 'u5',
    creationHeures: -120,
    prevuHeures: -72,
    livreHeures: -74,
  },
  {
    numeroSuivi: 'ST-2026-00401',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Coumba Gueye',
      '+221 78 512 66 09',
      'Quartier Santhiaba, villa 22',
      'Louga',
      8,
    ),
    description: 'Chaussures — 6 paires',
    poidsKg: 4.7,
    statut: 'echec',
    livreurId: 'u4',
    creationHeures: -96,
    prevuHeures: -24,
    motifEchec: 'destinataire absent',
  },
  {
    numeroSuivi: 'ST-2026-00398',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Alioune Cissé',
      '+221 77 305 41 88',
      'Rufisque Ouest, cité Keur Moussa',
      'Rufisque',
      9,
    ),
    description: 'Livres scolaires — 40 exemplaires',
    poidsKg: 6.3,
    statut: 'livre',
    livreurId: 'u6',
    creationHeures: -144,
    prevuHeures: -96,
    livreHeures: -110,
  },
  {
    numeroSuivi: 'ST-2026-00392',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Ndèye Fall',
      '+221 76 809 33 20',
      'Quartier Diourbel Escale, villa 61',
      'Diourbel',
      10,
    ),
    description: 'Électroménager — mini-four et bouilloire',
    poidsKg: 15.2,
    statut: 'livre',
    livreurId: 'u5',
    creationHeures: -192,
    prevuHeures: -144,
    livreHeures: -120,
  },
  {
    numeroSuivi: 'ST-2026-00385',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Babacar Diop',
      '+221 77 902 18 33',
      'Tambacounda, quartier Liberté',
      'Tambacounda',
      11,
    ),
    description: 'Panneaux solaires pliables — 2 unités',
    poidsKg: 22.5,
    statut: 'livre',
    livreurId: 'u6',
    creationHeures: -240,
    prevuHeures: -190,
    livreHeures: -196,
  },
  {
    numeroSuivi: 'ST-2026-00370',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Sokhna Mbaye',
      '+221 78 111 09 47',
      'Almadies, résidence Les Filaos',
      'Dakar',
      12,
    ),
    description: 'Mobilier de bureau — 1 fauteuil ergonomique',
    poidsKg: 18,
    statut: 'livre',
    livreurId: 'u4',
    creationHeures: -288,
    prevuHeures: -240,
    livreHeures: -218,
  },
  {
    numeroSuivi: 'ST-2026-00412',
    clientId: 'u2',
    expediteur: adresse(
      'Cheikh Ndiaye',
      '+221 76 304 22 90',
      'Boutique Teranga, avenue Lamine Guèye',
      'Thiès',
      2,
    ),
    destinataire: adresse(
      'Mame Diarra Bousso',
      '+221 77 480 12 66',
      'Ziguinchor, quartier Boucotte',
      'Ziguinchor',
      6,
    ),
    description: 'Ordinateurs portables reconditionnés — 5 unités',
    poidsKg: 9.6,
    statut: 'en_transit',
    livreurId: 'u6',
    creationHeures: -32,
    prevuHeures: 40,
  },
  {
    numeroSuivi: 'ST-2026-00409',
    clientId: 'u2',
    expediteur: adresse(
      'Cheikh Ndiaye',
      '+221 76 304 22 90',
      'Boutique Teranga, avenue Lamine Guèye',
      'Thiès',
      2,
    ),
    destinataire: adresse(
      'Awa Diop',
      '+221 77 512 40 18',
      'Sacré-Cœur 3, villa 145',
      'Dakar',
      1,
    ),
    description: 'Fournitures de bureau — ramettes et classeurs',
    poidsKg: 7.2,
    statut: 'en_attente',
    creationHeures: -16,
    prevuHeures: 30,
  },
  {
    numeroSuivi: 'ST-2026-00399',
    clientId: 'u2',
    expediteur: adresse(
      'Cheikh Ndiaye',
      '+221 76 304 22 90',
      'Boutique Teranga, avenue Lamine Guèye',
      'Thiès',
      2,
    ),
    destinataire: adresse(
      'Adama Seck',
      '+221 77 741 25 90',
      'Mbour, quartier Tefess',
      'Mbour',
      4,
    ),
    description: 'Vêtements en pagne — 12 pièces',
    poidsKg: 3.8,
    statut: 'livre',
    livreurId: 'u5',
    creationHeures: -168,
    prevuHeures: -120,
    livreHeures: -122,
  },
  {
    numeroSuivi: 'ST-2026-00390',
    clientId: 'u2',
    expediteur: adresse(
      'Cheikh Ndiaye',
      '+221 76 304 22 90',
      'Boutique Teranga, avenue Lamine Guèye',
      'Thiès',
      2,
    ),
    destinataire: adresse(
      'Pape Guèye',
      '+221 78 900 44 17',
      'Kaolack, quartier Léona',
      'Kaolack',
      7,
    ),
    description: 'Pièces auto — plaquettes et filtres',
    poidsKg: 14.5,
    statut: 'livre',
    livreurId: 'u6',
    creationHeures: -216,
    prevuHeures: -168,
    livreHeures: -150,
  },
  {
    numeroSuivi: 'ST-2026-00414',
    clientId: 'u3',
    expediteur: adresse(
      'Fatou Sow',
      '+221 78 118 55 07',
      'Atelier Minam, rue Blaise Diagne',
      'Saint-Louis',
      3,
    ),
    destinataire: adresse(
      'Bineta Thiam',
      '+221 77 220 90 31',
      'Dakar, Point E, rue 6',
      'Dakar',
      1,
    ),
    description: 'Produits de beauté — coffret prestige',
    poidsKg: 2.2,
    statut: 'en_transit',
    livreurId: 'u4',
    creationHeures: -26,
    prevuHeures: 20,
  },
  {
    numeroSuivi: 'ST-2026-00407',
    clientId: 'u3',
    expediteur: adresse(
      'Fatou Sow',
      '+221 78 118 55 07',
      'Atelier Minam, rue Blaise Diagne',
      'Saint-Louis',
      3,
    ),
    destinataire: adresse(
      'Seydou Ly',
      '+221 76 502 75 18',
      'Thiès, quartier Grand Standing',
      'Thiès',
      2,
    ),
    description: 'Manuels universitaires — 9 ouvrages',
    poidsKg: 5.1,
    statut: 'pris_en_charge',
    livreurId: 'u5',
    creationHeures: -22,
    prevuHeures: 44,
  },
  {
    numeroSuivi: 'ST-2026-00403',
    clientId: 'u3',
    expediteur: adresse(
      'Fatou Sow',
      '+221 78 118 55 07',
      'Atelier Minam, rue Blaise Diagne',
      'Saint-Louis',
      3,
    ),
    destinataire: adresse(
      'Aminata Touré',
      '+221 77 638 22 40',
      'Louga, quartier Keur Serigne Louga',
      'Louga',
      8,
    ),
    description: 'Épices et condiments — 18 sachets',
    poidsKg: 11.3,
    statut: 'livre',
    livreurId: 'u4',
    creationHeures: -150,
    prevuHeures: -100,
    livreHeures: -104,
  },
  {
    numeroSuivi: 'ST-2026-00364',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Amadou Diallo',
      '+221 76 884 12 03',
      'Quartier Sor, rue 22',
      'Saint-Louis',
      3,
    ),
    description: 'Riz et denrées — 2 sacs de 10 kg',
    poidsKg: 20.4,
    statut: 'livre',
    livreurId: 'u5',
    creationHeures: -816,
    prevuHeures: -760,
    livreHeures: -772,
  },
  {
    numeroSuivi: 'ST-2026-00359',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Marie Faye',
      '+221 77 401 66 28',
      'Mbour, quartier Grand Mbour',
      'Mbour',
      4,
    ),
    description: 'Tissus wax — 6 coupons',
    poidsKg: 6.8,
    statut: 'livre',
    livreurId: 'u5',
    creationHeures: -864,
    prevuHeures: -808,
    livreHeures: -815,
  },
  {
    numeroSuivi: 'ST-2026-00351',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Ousmane Ba',
      '+221 78 250 77 19',
      'Kaolack, quartier Médina Baye',
      'Kaolack',
      7,
    ),
    description: 'Cartouches d’encre — 12 unités',
    poidsKg: 4.2,
    statut: 'livre',
    livreurId: 'u6',
    creationHeures: -936,
    prevuHeures: -880,
    livreHeures: -888,
  },
  {
    numeroSuivi: 'ST-2026-00345',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Adjaratou Sow',
      '+221 76 119 40 55',
      'Tambacounda, quartier Liberté',
      'Tambacounda',
      11,
    ),
    description: 'Groupe électrogène 3,5 kW',
    poidsKg: 24.8,
    statut: 'livre',
    livreurId: 'u6',
    creationHeures: -912,
    prevuHeures: -856,
    livreHeures: -864,
  },
  {
    numeroSuivi: 'ST-2026-00338',
    clientId: 'u1',
    expediteur: adresse('Awa Diop', '+221 77 512 40 18', 'Sacré-Cœur 3, villa 145', 'Dakar', 1),
    destinataire: adresse(
      'Lamine Cissé',
      '+221 77 932 08 61',
      'Rufisque, quartier Gouye Ndiarème',
      'Rufisque',
      13,
    ),
    description: 'Vélos enfants — 2 unités démontées',
    poidsKg: 17.5,
    statut: 'livre',
    livreurId: 'u4',
    creationHeures: -888,
    prevuHeures: -832,
    livreHeures: -840,
  },
];

export const COLIS: Colis[] = DEFINITIONS.map((def, index) => {
  const id = `c${index + 1}`;
  const evenements = evenementsPour(def, id);
  const dateLivraison = def.livreHeures
    ? new Date(MAINTENANT + def.livreHeures * H).toISOString()
    : undefined;
  return {
    id,
    numeroSuivi: def.numeroSuivi,
    clientId: def.clientId,
    expediteur: def.expediteur,
    destinataire: def.destinataire,
    description: def.description,
    poidsKg: def.poidsKg,
    statut: def.statut,
    villeDepart: def.expediteur.ville,
    villeArrivee: def.destinataire.ville,
    distanceKm: distanceEntre(def.expediteur.ville, def.destinataire.ville),
    dateCreation: new Date(MAINTENANT + def.creationHeures * H).toISOString(),
    dateLivraisonPrevue: new Date(MAINTENANT + def.prevuHeures * H).toISOString(),
    dateLivraison,
    prixFcfa:
      1500 +
      Math.round(def.poidsKg * 450) +
      distanceEntre(def.expediteur.ville, def.destinataire.ville) * 12,
    livreurId: def.livreurId,
    historique: evenements,
  };
});

function tourneePour(colis: Colis): string {
  if (colis.villeArrivee === 'Dakar' || colis.villeArrivee === 'Rufisque') {
    return 'Tournée Dakar & banlieue';
  }
  if (['Thiès', 'Mbour', 'Diourbel', 'Touba'].includes(colis.villeArrivee)) {
    return 'Tournée Petite Côte';
  }
  return 'Tournée Grand Nord';
}

export const LIVRAISONS: Livraison[] = COLIS.filter((c) => Boolean(c.livreurId)).map(
  (colis, index) => ({
    id: `l${index + 1}`,
    colisId: colis.id,
    numeroSuivi: colis.numeroSuivi,
    livreurId: colis.livreurId as string,
    statut:
      colis.statut === 'livre'
        ? 'livre'
        : colis.statut === 'echec'
          ? 'echec'
          : colis.statut === 'en_transit'
            ? 'en_transit'
            : 'en_attente',
    dateAffectation: new Date(
      new Date(colis.dateCreation).getTime() + 5 * H,
    ).toISOString(),
    dateLivraison: colis.dateLivraison,
    motifEchec:
      colis.statut === 'echec' ? 'Destinataire absent lors du passage' : undefined,
    tournee: tourneePour(colis),
  }),
);

export const TOURNEES: Tournee[] = [
  {
    id: 't1',
    libelle: 'Tournée Dakar & banlieue',
    date: new Date(MAINTENANT).toISOString(),
    livreurId: 'u4',
    zones: ['Plateau', 'Médina', 'Almadies', 'Rufisque'],
    colisIds: COLIS.filter((c) => c.livreurId === 'u4').map((c) => c.id),
  },
  {
    id: 't2',
    libelle: 'Tournée Petite Côte',
    date: new Date(MAINTENANT).toISOString(),
    livreurId: 'u5',
    zones: ['Thiès', 'Mbour', 'Touba', 'Diourbel'],
    colisIds: COLIS.filter((c) => c.livreurId === 'u5').map((c) => c.id),
  },
  {
    id: 't3',
    libelle: 'Tournée Grand Nord',
    date: new Date(MAINTENANT + J).toISOString(),
    livreurId: 'u6',
    zones: ['Saint-Louis', 'Louga', 'Kaolack'],
    colisIds: COLIS.filter((c) => c.livreurId === 'u6').map((c) => c.id),
  },
];

/** Itinéraire indicatif DKR → THS utilisé par la carte du tableau de bord. */
export const ROUTE_DKR_THS: [number, number][] = [
  [14.7167, -17.4677],
  [14.7167, -17.2667],
  [14.7347, -17.1042],
  [14.7508, -17.0208],
  [14.7886, -16.9246],
];
