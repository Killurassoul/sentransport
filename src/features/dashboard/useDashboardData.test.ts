import { describe, expect, it } from 'vitest';
import { COLIS } from '@/mocks/data';
import { calculerDashboard } from './useDashboardData';

describe('calculerDashboard', () => {
  const donnees = calculerDashboard(COLIS, 'fr');

  it('met en avant un colis actif et expose les compteurs du mois', () => {
    expect(donnees.featured).toBeDefined();
    expect(['en_attente', 'pris_en_charge', 'en_transit']).toContain(
      donnees.featured?.statut,
    );
    expect(donnees.colisMois).toBeGreaterThan(0);
    expect(donnees.colisActifs).toBeGreaterThan(0);
    expect(donnees.autresColis.length).toBeLessThanOrEqual(8);
  });

  it('produit sept points pour la série hebdomadaire', () => {
    expect(donnees.series.colis).toHaveLength(7);
    expect(donnees.series.poids).toHaveLength(8);
    expect(donnees.series.distance).toHaveLength(8);
    expect(donnees.series.colis.every((point) => point.valeur >= 0)).toBe(true);
  });

  it('calcule une ponctualité cohérente avec les livraisons', () => {
    expect(donnees.ponctualite).toBeGreaterThanOrEqual(0);
    expect(donnees.ponctualite).toBeLessThanOrEqual(100);
    expect(donnees.aLheure + donnees.enRetard).toBe(
      COLIS.filter((c) => c.statut === 'livre').length,
    );
  });
});
