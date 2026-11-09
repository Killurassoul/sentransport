import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Compteur animé de 0 à la valeur (ease-out), respecte prefers-reduced-motion. */
export function useCountUp(valeur: number, decimales = 0, duree = 1100) {
  const reduit = useReducedMotion();
  const [affiche, setAffiche] = useState(reduit ? valeur : 0);

  useEffect(() => {
    if (reduit) {
      setAffiche(valeur);
      return;
    }
    let frame = 0;
    const debut = performance.now();
    const tick = (maintenant: number) => {
      const progression = Math.min(1, (maintenant - debut) / duree);
      const adouci = 1 - Math.pow(1 - progression, 3);
      const facteur = Math.pow(10, decimales);
      setAffiche(Math.round(valeur * adouci * facteur) / facteur);
      if (progression < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [valeur, decimales, duree, reduit]);

  return affiche;
}
