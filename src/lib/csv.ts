import type { Colis } from '@/api/types';
import { codeVille } from './constants';
import { dateCourte } from './format';

function cellule(valeur: string | number | undefined) {
  const texte = String(valeur ?? '');
  if (/[;"\n\r]/.test(texte)) {
    return `"${texte.replace(/"/g, '""')}"`;
  }
  return texte;
}

export function telechargerCsv(
  nomFichier: string,
  entetes: string[],
  lignes: (string | number | undefined)[][],
) {
  const contenu = [entetes, ...lignes]
    .map((ligne) => ligne.map(cellule).join(';'))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${contenu}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exporterColis(colis: Colis[], langue = 'fr') {
  const entetes = [
    'Numéro de suivi',
    'Expéditeur',
    'Téléphone expéditeur',
    'Destinataire',
    'Téléphone destinataire',
    'Adresse destinataire',
    'Départ',
    'Arrivée',
    'Statut',
    'Poids (kg)',
    'Distance (km)',
    'Prix (FCFA)',
    'Créé le',
    'Livraison prévue',
  ];
  const lignes = colis.map((c) => [
    c.numeroSuivi,
    c.expediteur.nom,
    c.expediteur.telephone,
    c.destinataire.nom,
    c.destinataire.telephone,
    `${c.destinataire.adresse}, ${c.destinataire.ville}`,
    codeVille(c.villeDepart),
    codeVille(c.villeArrivee),
    c.statut,
    c.poidsKg,
    c.distanceKm,
    c.prixFcfa,
    dateCourte(c.dateCreation, langue),
    dateCourte(c.dateLivraisonPrevue, langue),
  ]);
  const date = new Date().toISOString().slice(0, 10);
  telechargerCsv(`sentransport-colis-${date}.csv`, entetes, lignes);
}
