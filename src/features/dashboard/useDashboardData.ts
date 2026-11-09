import { useMemo } from 'react';
import type { Colis } from '@/api/types';
import { useColisList } from '@/api/hooks/colis';
import { useUIStore } from '@/store/ui';
import type { PointMini } from '@/components/dashboard/MiniChart';

function debutDeMois(reference: Date) {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

function estDansLeMois(iso: string, reference: Date) {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

function moyenne(valeurs: number[]) {
  if (valeurs.length === 0) return 0;
  return valeurs.reduce((somme, v) => somme + v, 0) / valeurs.length;
}

function evolution(actuel: number, precedent: number) {
  if (precedent === 0) return null;
  return ((actuel - precedent) / precedent) * 100;
}

export interface DashboardData {
  colis: Colis[];
  colisMois: number;
  poidsMoyen: number;
  distanceMoyenne: number;
  variations: {
    colis: number | null;
    poids: number | null;
    distance: number | null;
  };
  series: {
    colis: PointMini[];
    poids: PointMini[];
    distance: PointMini[];
  };
  ponctualite: number;
  aLheure: number;
  enRetard: number;
  colisActifs: number;
  featured?: Colis;
  autresColis: Colis[];
}

export function calculerDashboard(colis: Colis[], langue: string): DashboardData {
  const maintenant = new Date();
  const moisPrecedent = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth() - 1,
    1,
  );

  const duMois = colis.filter((c) => estDansLeMois(c.dateCreation, maintenant));
  const duMoisPrecedent = colis.filter((c) =>
    estDansLeMois(c.dateCreation, moisPrecedent),
  );

  const poidsMoyen = moyenne(duMois.map((c) => c.poidsKg));
  const distanceMoyenne = moyenne(duMois.map((c) => c.distanceKm));

  const formateurJour = new Intl.DateTimeFormat(
    langue === 'fr' ? 'fr-FR' : 'en-GB',
    { weekday: 'short' },
  );

  const septJours: PointMini[] = Array.from({ length: 7 }).map((_, index) => {
    const jour = new Date(maintenant);
    jour.setDate(maintenant.getDate() - (6 - index));
    const cle = jour.toDateString();
    return {
      label: formateurJour.format(jour).replace('.', ''),
      valeur: colis.filter((c) => new Date(c.dateCreation).toDateString() === cle)
        .length,
    };
  });

  const chronologiques = [...colis]
    .sort((a, b) => +new Date(a.dateCreation) - +new Date(b.dateCreation))
    .slice(-8);

  const seriesPoids = chronologiques.map((c, index) => ({
    label: `#${index + 1}`,
    valeur: c.poidsKg,
  }));
  const seriesDistance = chronologiques.map((c, index) => ({
    label: `#${index + 1}`,
    valeur: c.distanceKm,
  }));

  const livres = colis.filter((c) => c.statut === 'livre');
  const aLheure = livres.filter(
    (c) =>
      c.dateLivraison &&
      +new Date(c.dateLivraison) <= +new Date(c.dateLivraisonPrevue),
  ).length;
  const enRetard = livres.length - aLheure;
  const ponctualite =
    livres.length > 0
      ? Math.round((aLheure / livres.length) * 100)
      : Math.round(
          (colis.filter((c) => +new Date(c.dateLivraisonPrevue) >= +maintenant).length /
            Math.max(1, colis.length)) *
            100,
        );

  const actifs = colis.filter(
    (c) => c.statut !== 'livre' && c.statut !== 'echec',
  );

  const featured =
    actifs.find((c) => c.statut === 'en_transit') ??
    actifs[0] ??
    colis[0];

  return {
    colis,
    colisMois: duMois.length,
    poidsMoyen,
    distanceMoyenne,
    variations: {
      colis: evolution(duMois.length, duMoisPrecedent.length),
      poids: evolution(
        poidsMoyen,
        moyenne(duMoisPrecedent.map((c) => c.poidsKg)),
      ),
      distance: evolution(
        distanceMoyenne,
        moyenne(duMoisPrecedent.map((c) => c.distanceKm)),
      ),
    },
    series: {
      colis: septJours,
      poids: seriesPoids,
      distance: seriesDistance,
    },
    ponctualite,
    aLheure,
    enRetard,
    colisActifs: actifs.length,
    featured,
    autresColis: colis.filter((c) => c.id !== featured?.id).slice(0, 8),
  };
}

export function useDashboardData() {
  const requete = useColisList({ limit: 100, tri: 'recent' });
  const langue = useUIStore((s) => s.langue);

  const donnees = useMemo(
    () => (requete.data ? calculerDashboard(requete.data.items, langue) : null),
    [requete.data, langue],
  );

  return { ...requete, donnees };
}

export { debutDeMois };
