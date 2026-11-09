import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Fusionne les classes Tailwind en respectant la priorité des dernières valeurs. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
