import { afterEach, describe, expect, it, vi } from 'vitest';
import { COLIS } from '@/mocks/data';
import { exporterColis, telechargerCsv } from './csv';

let dernierBlob: Blob | null = null;

afterEach(() => {
  dernierBlob = null;
  vi.restoreAllMocks();
});

function lireBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(String(lecteur.result));
    lecteur.onerror = () => reject(lecteur.error);
    lecteur.readAsText(blob);
  });
}

function lireOctets(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(new Uint8Array(lecteur.result as ArrayBuffer));
    lecteur.onerror = () => reject(lecteur.error);
    lecteur.readAsArrayBuffer(blob);
  });
}

function capturerBlob() {
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    dernierBlob = blob as Blob;
    return 'blob:sentransport';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
}

describe('export CSV', () => {
  it('échappe les séparateurs et les guillemets', async () => {
    capturerBlob();
    telechargerCsv('test.csv', ['Nom', 'Description'], [['Awa', 'Colis; fragile "haut"']]);

    const octets = await lireOctets(dernierBlob!);
    expect([...octets.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const texte = new TextDecoder().decode(octets);
    expect(texte).toContain('Nom;Description');
    expect(texte).toContain('Awa;"Colis; fragile ""haut"""');
  });

  it('exporte les colis avec leurs informations principales', async () => {
    capturerBlob();
    const colis = COLIS[0];
    exporterColis([colis]);

    const texte = await lireBlob(dernierBlob!);
    expect(texte).toContain('Numéro de suivi');
    expect(texte).toContain(colis.numeroSuivi);
    expect(texte).toContain(colis.destinataire.nom);
    expect(texte).toContain(String(colis.poidsKg));
    expect(texte).toContain(String(colis.prixFcfa));
  });
});
