import { http, HttpResponse, delay } from 'msw';
import type {
  Colis,
  ColisListParams,
  CreateColisPayload,
  EvenementSuivi,
  Livraison,
  LoginPayload,
  RegisterPayload,
  StatutColis,
  StatutLivraison,
  UpdateStatutPayload,
  Utilisateur,
} from '@/api/types';
import { distanceEntre } from '@/lib/constants';
import { COLIS, LIVRAISONS, MOT_DE_PASSE_DEMO, UTILISATEURS } from './data';

/* -------------------------------------------------------------------------- */
/* Base de données en mémoire (réinitialisée à chaque rechargement)            */
/* -------------------------------------------------------------------------- */

let colisDb: Colis[] = structuredClone(COLIS);
let livraisonsDb: Livraison[] = structuredClone(LIVRAISONS);
let utilisateursDb: Utilisateur[] = structuredClone(UTILISATEURS);

export function reinitialiserBaseMock() {
  colisDb = structuredClone(COLIS);
  livraisonsDb = structuredClone(LIVRAISONS);
  utilisateursDb = structuredClone(UTILISATEURS);
}

const LATENCE = 220;
const LATENCE_MUTATION = 380;

function erreur(message: string, status = 400) {
  return HttpResponse.json({ message }, { status });
}

function tokenPour(id: string) {
  return `mock.${id}.${Date.now().toString(36)}`;
}

function utilisateurDuToken(request: Request): Utilisateur | null {
  const entete = request.headers.get('Authorization');
  if (!entete?.startsWith('Bearer ')) return null;
  const token = entete.slice('Bearer '.length);
  const [prefixe, id] = token.split('.');
  if (prefixe !== 'mock' || !id) return null;
  return utilisateursDb.find((u) => u.id === id) ?? null;
}

const authRequise = () =>
  erreur('Authentification requise. Reconnectez-vous.', 401);

function tourneePour(villeArrivee: string) {
  if (['Dakar', 'Rufisque'].includes(villeArrivee)) return 'Tournée Dakar & banlieue';
  if (['Thiès', 'Mbour', 'Diourbel', 'Touba'].includes(villeArrivee))
    return 'Tournée Petite Côte';
  return 'Tournée Grand Nord';
}

function libelleStatut(statut: StatutColis, colis: Colis) {
  switch (statut) {
    case 'en_attente':
      return 'Colis enregistré au guichet';
    case 'pris_en_charge':
      return 'Colis pris en charge par le livreur';
    case 'en_transit':
      return `En transit vers ${colis.villeArrivee}`;
    case 'livre':
      return `Colis remis à ${colis.destinataire.nom}`;
    case 'echec':
      return 'Échec de livraison';
    default:
      return 'Mise à jour du colis';
  }
}

function ajouterEvenement(colis: Colis, statut: StatutColis, libelle?: string) {
  const evenement: EvenementSuivi = {
    id: `${colis.id}-e${colis.historique.length + 1}-${Date.now().toString(36)}`,
    statut,
    libelle: libelle ?? libelleStatut(statut, colis),
    lieu:
      statut === 'en_transit'
        ? `${colis.villeDepart} → ${colis.villeArrivee}`
        : colis.villeArrivee,
    date: new Date().toISOString(),
    acteur: 'SenTransport',
  };
  colis.historique = [...colis.historique, evenement];
}

/* -------------------------------------------------------------------------- */
/* Handlers                                                                   */
/* -------------------------------------------------------------------------- */

export const handlers = [
  /* ----------------------------- Utilisateurs ---------------------------- */
  http.post('/api/users/login', async ({ request }) => {
    await delay(LATENCE_MUTATION);
    const { email, password } = (await request.json()) as LoginPayload;
    const utilisateur = utilisateursDb.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!utilisateur || password !== MOT_DE_PASSE_DEMO) {
      return erreur('E-mail ou mot de passe incorrect.', 401);
    }
    if (!utilisateur.actif) {
      return erreur('Ce compte a été désactivé. Contactez un administrateur.', 403);
    }
    return HttpResponse.json({
      token: tokenPour(utilisateur.id),
      utilisateur,
    });
  }),

  http.post('/api/users/register', async ({ request }) => {
    await delay(LATENCE_MUTATION);
    const payload = (await request.json()) as RegisterPayload;
    const existe = utilisateursDb.some(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase(),
    );
    if (existe) return erreur('Un compte existe déjà avec cette adresse e-mail.', 409);
    const utilisateur: Utilisateur = {
      id: `u${utilisateursDb.length + 1}`,
      prenom: payload.prenom,
      nom: payload.nom,
      email: payload.email.toLowerCase(),
      telephone: payload.telephone,
      role: payload.role,
      ville: payload.ville,
      actif: true,
      createdAt: new Date().toISOString(),
      ...(payload.role === 'livreur'
        ? {
            vehicule: 'Renault Kangoo ZE',
            immatriculation: 'DK-0000-AA',
            capaciteKg: 600,
            note: 5,
          }
        : {}),
    };
    utilisateursDb = [...utilisateursDb, utilisateur];
    return HttpResponse.json(
      { token: tokenPour(utilisateur.id), utilisateur },
      { status: 201 },
    );
  }),

  http.get('/api/users/me', async ({ request }) => {
    await delay(LATENCE);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    return HttpResponse.json(utilisateur);
  }),

  http.patch('/api/users/me/password', async ({ request }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const { actuel, nouveau } = (await request.json()) as {
      actuel: string;
      nouveau: string;
    };
    if (actuel !== MOT_DE_PASSE_DEMO) {
      return erreur('Le mot de passe actuel est incorrect.', 400);
    }
    if (!nouveau || nouveau.length < 8) {
      return erreur('Le nouveau mot de passe doit contenir au moins 8 caractères.', 400);
    }
    return HttpResponse.json({ message: 'Mot de passe mis à jour.' });
  }),

  http.patch('/api/users/me', async ({ request }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const payload = (await request.json()) as Partial<Utilisateur>;
    const misAJour: Utilisateur = {
      ...utilisateur,
      prenom: payload.prenom ?? utilisateur.prenom,
      nom: payload.nom ?? utilisateur.nom,
      telephone: payload.telephone ?? utilisateur.telephone,
      ville: payload.ville ?? utilisateur.ville,
      email: payload.email ?? utilisateur.email,
    };
    utilisateursDb = utilisateursDb.map((u) =>
      u.id === utilisateur.id ? misAJour : u,
    );
    return HttpResponse.json(misAJour);
  }),

  http.get('/api/users', async ({ request }) => {
    await delay(LATENCE);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const liste = [...utilisateursDb]
      .filter((u) => (role ? u.role === role : true))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return HttpResponse.json(liste);
  }),

  http.patch('/api/users/:id', async ({ request, params }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    if (utilisateur.role !== 'administrateur') {
      return erreur('Action réservée aux administrateurs.', 403);
    }
    const cible = utilisateursDb.find((u) => u.id === params.id);
    if (!cible) return erreur('Utilisateur introuvable.', 404);
    const payload = (await request.json()) as Partial<Utilisateur>;
    const misAJour = { ...cible, ...payload };
    utilisateursDb = utilisateursDb.map((u) =>
      u.id === cible.id ? misAJour : u,
    );
    return HttpResponse.json(misAJour);
  }),

  /* -------------------------------- Colis -------------------------------- */
  http.get('/api/colis/suivi/:numero', async ({ params }) => {
    await delay(LATENCE);
    const numero = String(params.numero ?? '').trim().toLowerCase();
    const colis = colisDb.find((c) => c.numeroSuivi.toLowerCase() === numero);
    if (!colis) return erreur('Aucun colis ne correspond à ce numéro de suivi.', 404);
    return HttpResponse.json(colis);
  }),

  http.get('/api/colis', async ({ request }) => {
    await delay(LATENCE);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? 10)));
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const statut = (url.searchParams.get('statut') ?? 'tous') as
      | StatutColis
      | 'tous';
    const ville = url.searchParams.get('ville') ?? '';
    const livreurId = url.searchParams.get('livreurId') ?? '';
    const tri = (url.searchParams.get('tri') ?? 'recent') as ColisListParams['tri'];

    let liste = [...colisDb];
    if (utilisateur.role === 'client') {
      liste = liste.filter(
        (c) => c.clientId === utilisateur.id || c.destinataire.nom === `${utilisateur.prenom} ${utilisateur.nom}`,
      );
    } else if (utilisateur.role === 'livreur') {
      liste = liste.filter((c) => c.livreurId === utilisateur.id);
    }

    if (statut !== 'tous') liste = liste.filter((c) => c.statut === statut);
    if (ville) {
      liste = liste.filter(
        (c) => c.villeDepart === ville || c.villeArrivee === ville,
      );
    }
    if (livreurId) liste = liste.filter((c) => c.livreurId === livreurId);
    if (q) {
      liste = liste.filter((c) =>
        [
          c.numeroSuivi,
          c.destinataire.nom,
          c.expediteur.nom,
          c.description,
          c.villeDepart,
          c.villeArrivee,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }

    liste.sort((a, b) => {
      if (tri === 'ancien') return +new Date(a.dateCreation) - +new Date(b.dateCreation);
      if (tri === 'poids') return b.poidsKg - a.poidsKg;
      if (tri === 'numero') return a.numeroSuivi.localeCompare(b.numeroSuivi);
      return +new Date(b.dateCreation) - +new Date(a.dateCreation);
    });

    const total = liste.length;
    const pageCount = Math.max(1, Math.ceil(total / limit));
    const items = liste.slice((page - 1) * limit, (page - 1) * limit + limit);
    return HttpResponse.json({ items, total, page, limit, pageCount });
  }),

  http.get('/api/colis/:id', async ({ request, params }) => {
    await delay(LATENCE);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const colis = colisDb.find(
      (c) => c.id === params.id || c.numeroSuivi === params.id,
    );
    if (!colis) return erreur('Colis introuvable.', 404);
    return HttpResponse.json(colis);
  }),

  http.post('/api/colis', async ({ request }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const payload = (await request.json()) as CreateColisPayload;
    if (!payload.expediteur?.nom || !payload.destinataire?.nom) {
      return erreur('Les informations d’expéditeur et de destinataire sont requises.');
    }
    const derniereReference = colisDb.reduce((max, c) => {
      const valeur = Number(c.numeroSuivi.split('-')[2] ?? 0);
      return Number.isFinite(valeur) ? Math.max(max, valeur) : max;
    }, 416);
    const numeroSuivi = `ST-2026-${String(derniereReference + 1).padStart(5, '0')}`;
    const distance = distanceEntre(payload.villeDepart, payload.villeArrivee);
    const colis: Colis = {
      id: `c${colisDb.length + 1}-${Date.now().toString(36)}`,
      numeroSuivi,
      clientId: utilisateur.role === 'client' ? utilisateur.id : 'u1',
      expediteur: payload.expediteur,
      destinataire: payload.destinataire,
      description: payload.description,
      poidsKg: Number(payload.poidsKg),
      statut: 'en_attente',
      villeDepart: payload.villeDepart,
      villeArrivee: payload.villeArrivee,
      distanceKm: distance,
      dateCreation: new Date().toISOString(),
      dateLivraisonPrevue: payload.dateLivraisonPrevue,
      prixFcfa: 1500 + Math.round(Number(payload.poidsKg) * 450) + distance * 12,
      historique: [
        {
          id: `ev-${Date.now().toString(36)}`,
          statut: 'en_attente',
          libelle: 'Colis enregistré au guichet',
          lieu: payload.villeDepart,
          date: new Date().toISOString(),
          acteur: `${utilisateur.prenom} ${utilisateur.nom}`,
        },
      ],
    };
    colisDb = [colis, ...colisDb];
    return HttpResponse.json(colis, { status: 201 });
  }),

  http.patch('/api/colis/:id', async ({ request, params }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const colis = colisDb.find(
      (c) => c.id === params.id || c.numeroSuivi === params.id,
    );
    if (!colis) return erreur('Colis introuvable.', 404);
    const payload = (await request.json()) as Partial<Colis>;
    const statutPrecedent = colis.statut;
    const misAJour: Colis = {
      ...colis,
      description: payload.description ?? colis.description,
      poidsKg: payload.poidsKg ?? colis.poidsKg,
      destinataire: payload.destinataire ?? colis.destinataire,
      expediteur: payload.expediteur ?? colis.expediteur,
      dateLivraisonPrevue: payload.dateLivraisonPrevue ?? colis.dateLivraisonPrevue,
      statut: (payload.statut as StatutColis) ?? colis.statut,
    };
    if (misAJour.statut !== statutPrecedent) {
      ajouterEvenement(misAJour, misAJour.statut);
      if (misAJour.statut === 'livre') misAJour.dateLivraison = new Date().toISOString();
    }
    colisDb = colisDb.map((c) => (c.id === colis.id ? misAJour : c));
    if (misAJour.livreurId) {
      livraisonsDb = livraisonsDb.map((l) =>
        l.colisId === misAJour.id
          ? {
              ...l,
              statut:
                misAJour.statut === 'livre'
                  ? 'livre'
                  : misAJour.statut === 'echec'
                    ? 'echec'
                    : misAJour.statut === 'en_transit'
                      ? 'en_transit'
                      : 'en_attente',
              dateLivraison: misAJour.dateLivraison,
            }
          : l,
      );
    }
    return HttpResponse.json(misAJour);
  }),

  http.delete('/api/colis/:id', async ({ request, params }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const colis = colisDb.find(
      (c) => c.id === params.id || c.numeroSuivi === params.id,
    );
    if (!colis) return erreur('Colis introuvable.', 404);
    colisDb = colisDb.filter((c) => c.id !== colis.id);
    livraisonsDb = livraisonsDb.filter((l) => l.colisId !== colis.id);
    return new HttpResponse(null, { status: 204 });
  }),

  /* ------------------------------ Livraisons ----------------------------- */
  http.get('/api/livraisons', async ({ request }) => {
    await delay(LATENCE);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const url = new URL(request.url);
    const livreurId = url.searchParams.get('livreurId');

    let liste = [...livraisonsDb];
    if (livreurId) liste = liste.filter((l) => l.livreurId === livreurId);
    if (utilisateur.role === 'livreur') {
      liste = liste.filter((l) => l.livreurId === utilisateur.id);
    }
    if (utilisateur.role === 'client') {
      const ids = new Set(
        colisDb.filter((c) => c.clientId === utilisateur.id).map((c) => c.id),
      );
      liste = liste.filter((l) => ids.has(l.colisId));
    }
    liste.sort((a, b) => +new Date(b.dateAffectation) - +new Date(a.dateAffectation));
    return HttpResponse.json(liste);
  }),

  http.post('/api/livraisons', async ({ request }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    if (utilisateur.role === 'client') {
      return erreur('Action réservée aux administrateurs et livreurs.', 403);
    }
    const { colisId, livreurId } = (await request.json()) as {
      colisId: string;
      livreurId: string;
    };
    const colis = colisDb.find((c) => c.id === colisId || c.numeroSuivi === colisId);
    const livreur = utilisateursDb.find(
      (u) => u.id === livreurId && u.role === 'livreur',
    );
    if (!colis) return erreur('Colis introuvable.', 404);
    if (!livreur) return erreur('Livreur introuvable.', 404);
    const livraison: Livraison = {
      id: `l-${Date.now().toString(36)}`,
      colisId: colis.id,
      numeroSuivi: colis.numeroSuivi,
      livreurId: livreur.id,
      statut: 'en_attente',
      dateAffectation: new Date().toISOString(),
      tournee: tourneePour(colis.villeArrivee),
    };
    livraisonsDb = [livraison, ...livraisonsDb];
    colis.livreurId = livreur.id;
    if (colis.statut === 'en_attente') {
      colis.statut = 'pris_en_charge';
      ajouterEvenement(
        colis,
        'pris_en_charge',
        `Colis affecté à ${livreur.prenom} ${livreur.nom}`,
      );
    }
    return HttpResponse.json(livraison, { status: 201 });
  }),

  http.patch('/api/livraisons/:id/statut', async ({ request, params }) => {
    await delay(LATENCE_MUTATION);
    const utilisateur = utilisateurDuToken(request);
    if (!utilisateur) return authRequise();
    const livraison = livraisonsDb.find((l) => l.id === params.id);
    if (!livraison) return erreur('Livraison introuvable.', 404);
    const payload = (await request.json()) as UpdateStatutPayload;
    if (payload.statut === 'echec' && !payload.motifEchec?.trim()) {
      return erreur('Un motif est requis pour déclarer un échec de livraison.');
    }
    const colis = colisDb.find((c) => c.id === livraison.colisId);
    if (!colis) return erreur('Colis associé introuvable.', 404);

    const miseAJour: Livraison = {
      ...livraison,
      statut: payload.statut as StatutLivraison,
      motifEchec: payload.statut === 'echec' ? payload.motifEchec : undefined,
      dateLivraison:
        payload.statut === 'livre' ? new Date().toISOString() : livraison.dateLivraison,
    };
    livraisonsDb = livraisonsDb.map((l) => (l.id === livraison.id ? miseAJour : l));

    colis.statut =
      payload.statut === 'en_attente' ? 'pris_en_charge' : (payload.statut as StatutColis);
    if (payload.statut === 'livre') colis.dateLivraison = miseAJour.dateLivraison;
    if (payload.statut === 'echec') {
      ajouterEvenement(
        colis,
        'echec',
        `Échec de livraison — ${payload.motifEchec}`,
      );
    } else if (payload.statut === 'livre') {
      ajouterEvenement(colis, 'livre');
    } else if (payload.statut === 'en_transit') {
      ajouterEvenement(colis, 'en_transit');
    }

    return HttpResponse.json(miseAJour);
  }),
];

export { colisDb, livraisonsDb, utilisateursDb };
