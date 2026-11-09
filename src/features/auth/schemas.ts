import { z } from 'zod';
import type { CleTraduction } from '@/lib/i18n';

export type Traducteur = (
  cle: CleTraduction,
  variables?: Record<string, string | number>,
) => string;

export function schemaConnexion(t: Traducteur) {
  return z.object({
    email: z
      .string()
      .min(1, t('valid.requis'))
      .email(t('valid.email')),
    motDePasse: z.string().min(1, t('valid.requis')),
    seSouvenir: z.boolean().optional(),
  });
}

export type DonneesConnexion = z.infer<ReturnType<typeof schemaConnexion>>;

export function schemaInscription(t: Traducteur) {
  return z.object({
    prenom: z.string().trim().min(2, t('valid.nom')),
    nom: z.string().trim().min(2, t('valid.nom')),
    email: z.string().min(1, t('valid.requis')).email(t('valid.email')),
    telephone: z
      .string()
      .min(1, t('valid.requis'))
      .regex(/^(\+221[\s-]?)?7[0678][\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, t('valid.tel')),
    ville: z.string().min(1, t('valid.ville')),
    role: z.enum(['client', 'livreur'], {
      errorMap: () => ({ message: t('valid.role') }),
    }),
    motDePasse: z
      .string()
      .min(8, t('valid.mdp'))
      .regex(/[A-Za-z]/, t('valid.mdp'))
      .regex(/\d/, t('valid.mdp')),
  });
}

export type DonneesInscription = z.infer<ReturnType<typeof schemaInscription>>;

export function schemaColis(t: Traducteur) {
  const contact = z.object({
    nom: z.string().trim().min(2, t('valid.nom')),
    telephone: z
      .string()
      .min(1, t('valid.requis'))
      .regex(/^(\+221[\s-]?)?7[0678][\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/, t('valid.tel')),
    adresse: z.string().trim().min(5, t('valid.requis')),
    ville: z.string().min(1, t('valid.ville')),
  });

  return z.object({
    expediteur: contact,
    destinataire: contact,
    description: z.string().trim().min(10, t('valid.description')),
    poidsKg: z.coerce.number().positive(t('valid.poids')).max(1000, t('valid.poids')),
    villeDepart: z.string().min(1, t('valid.ville')),
    villeArrivee: z.string().min(1, t('valid.ville')),
    dateLivraisonPrevue: z
      .string()
      .min(1, t('valid.requis'))
      .refine((valeur) => +new Date(valeur) > Date.now(), t('valid.date')),
  });
}

export type DonneesColis = z.infer<ReturnType<typeof schemaColis>>;
