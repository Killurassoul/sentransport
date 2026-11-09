/** Formatage FR — montants, dates, nombres, durée. */

const LOCALES: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' };

export function fcfa(montant: number, langue = 'fr') {
  return new Intl.NumberFormat(LOCALES[langue] ?? 'fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(montant);
}

export function nombre(valeur: number, langue = 'fr', decimales = 0) {
  return new Intl.NumberFormat(LOCALES[langue] ?? 'fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur);
}

export function decimal(valeur: number, langue = 'fr', decimales = 1) {
  return nombre(valeur, langue, decimales);
}

export function dateCourte(iso: string, langue = 'fr') {
  return new Intl.DateTimeFormat(LOCALES[langue] ?? 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function dateLongue(iso: string, langue = 'fr') {
  return new Intl.DateTimeFormat(LOCALES[langue] ?? 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function heure(iso: string, langue = 'fr') {
  return new Intl.DateTimeFormat(LOCALES[langue] ?? 'fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function dateHeure(iso: string, langue = 'fr') {
  return `${dateCourte(iso, langue)} · ${heure(iso, langue)}`;
}

/** "il y a 2 h", "dans 3 j" */
export function depuis(iso: string, langue = 'fr') {
  const diff = new Date(iso).getTime() - Date.now();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat(LOCALES[langue] ?? 'fr-FR', {
    numeric: 'auto',
  });
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const heures = Math.round(minutes / 60);
  if (Math.abs(heures) < 24) return rtf.format(heures, 'hour');
  const jours = Math.round(heures / 24);
  if (Math.abs(jours) < 30) return rtf.format(jours, 'day');
  return rtf.format(Math.round(jours / 30), 'month');
}

export function dureeDepuis(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${heures} h` : `${heures} h ${reste}`;
}

/** Valeur pour `<input type="datetime-local">`. */
export function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
