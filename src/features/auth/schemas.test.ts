import { describe, expect, it } from 'vitest';
import { traduire, type CleTraduction } from '@/lib/i18n';
import { schemaColis, schemaConnexion, schemaInscription } from './schemas';

const t = (cle: CleTraduction) => traduire('fr', cle);
const demain = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);

describe('schémas de formulaire', () => {
  it('accepte une connexion valide et refuse un e-mail incorrect', () => {
    expect(
      schemaConnexion(t).safeParse({
        email: 'awa.diop@sentransport.sn',
        motDePasse: 'Demo1234!',
      }).success,
    ).toBe(true);

    const resultat = schemaConnexion(t).safeParse({
      email: 'awa',
      motDePasse: '',
    });
    expect(resultat.success).toBe(false);
  });

  it('exige un numéro sénégalais et un mot de passe robuste à l’inscription', () => {
    const base = {
      prenom: 'Awa',
      nom: 'Diop',
      email: 'awa@sentransport.sn',
      ville: 'Dakar',
      role: 'client' as const,
    };

    expect(
      schemaInscription(t).safeParse({
        ...base,
        telephone: '+221 77 512 40 18',
        motDePasse: 'Demo1234!',
      }).success,
    ).toBe(true);

    expect(
      schemaInscription(t).safeParse({
        ...base,
        telephone: '77 51 24',
        motDePasse: 'court',
      }).success,
    ).toBe(false);
  });

  it('refuse une date de livraison passée et un poids nul', () => {
    const contact = {
      nom: 'Mariama Diallo',
      telephone: '+221 77 842 19 06',
      adresse: 'Cité Lamy, rue 12',
      ville: 'Thiès',
    };
    const colis = {
      expediteur: contact,
      destinataire: contact,
      description: 'Documents notariés sous enveloppe',
      villeDepart: 'Dakar',
      villeArrivee: 'Thiès',
      dateLivraisonPrevue: demain,
      poidsKg: 2.4,
    };

    expect(schemaColis(t).safeParse(colis).success).toBe(true);
    expect(
      schemaColis(t).safeParse({
        ...colis,
        poidsKg: 0,
        dateLivraisonPrevue: '2020-01-01T10:00',
      }).success,
    ).toBe(false);
  });
});
