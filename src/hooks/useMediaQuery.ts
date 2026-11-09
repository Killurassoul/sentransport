import { useEffect, useState } from 'react';

export function useMediaQuery(requete: string) {
  const [correspond, setCorrespond] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(requete).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia(requete);
    const surChangement = () => setCorrespond(media.matches);
    surChangement();
    media.addEventListener('change', surChangement);
    return () => media.removeEventListener('change', surChangement);
  }, [requete]);

  return correspond;
}
