export { cn } from './cn';

/** Initiales d'un nom complet ("Awa Diop" -> "AD"). */
export function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

const TEINTES = [
  'bg-[#E9E4FF] text-[#4B34B8]',
  'bg-[#E4F5EC] text-[#177245]',
  'bg-[#FDF0DC] text-[#8A5A08]',
  'bg-[#E7EEFD] text-[#1E4FA8]',
  'bg-[#FBE7EC] text-[#9D2443]',
];

/** Teinte stable dérivée de l'identifiant (avatars sans image). */
export function teinteAvatar(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return TEINTES[hash % TEINTES.length] ?? TEINTES[0];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Découpe un tableau en pages. */
export function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
