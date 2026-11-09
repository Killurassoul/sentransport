import { useCallback } from 'react';
import { useUIStore } from '@/store/ui';
import { traduire, type CleTraduction } from '@/lib/i18n';

export function useI18n() {
  const langue = useUIStore((s) => s.langue);
  const t = useCallback(
    (cle: CleTraduction, variables?: Record<string, string | number>) =>
      traduire(langue, cle, variables),
    [langue],
  );
  return { t, langue, locale: langue === 'fr' ? 'fr-FR' : 'en-GB' };
}
