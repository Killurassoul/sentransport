import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minus, Plus, Scan } from 'lucide-react';
import type { Colis } from '@/api/types';
import { codeVille, villeParNom } from '@/lib/constants';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { dateCourte } from '@/lib/format';

type Coordonnees = [number, number];

function iconeGroupe(code: string, nombre: number) {
  return L.divIcon({
    className: 'map-pill-marker',
    html: `<span class="map-pill map-pill--accent"><span class="map-pill__dot">${nombre}</span>${code}</span>`,
    iconSize: [86, 28],
    iconAnchor: [43, 14],
  });
}

export function MapReseau({ colis }: { colis: Colis[] }) {
  const { t, langue } = useI18n();
  const theme = useUIStore((s) => s.theme);
  const [carte, setCarte] = useState<L.Map | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const groupes = useMemo(() => {
    const map = new Map<string, Colis[]>();
    colis.forEach((c) => {
      const groupe = map.get(c.villeArrivee) ?? [];
      groupe.push(c);
      map.set(c.villeArrivee, groupe);
    });
    return [...map.entries()]
      .map(([ville, elements]) => {
        const centre = villeParNom(ville);
        if (!centre) return null;
        return {
          ville,
          code: codeVille(ville),
          elements,
          position: [centre.lat, centre.lng] as Coordonnees,
        };
      })
      .filter((groupe): groupe is NonNullable<typeof groupe> => Boolean(groupe));
  }, [colis]);

  const points = useMemo(() => groupes.map((g) => g.position), [groupes]);

  useEffect(() => {
    if (!carte || !conteneurRef.current) return;
    const observateur = new ResizeObserver(() => carte.invalidateSize());
    observateur.observe(conteneurRef.current);
    const surPleinEcran = () => window.setTimeout(() => carte.invalidateSize(), 120);
    document.addEventListener('fullscreenchange', surPleinEcran);
    return () => {
      observateur.disconnect();
      document.removeEventListener('fullscreenchange', surPleinEcran);
    };
  }, [carte]);

  const recadrer = () => {
    if (!carte || points.length === 0) return;
    carte.invalidateSize();
    if (points.length === 1) {
      carte.setView(points[0] as Coordonnees, 9);
      return;
    }
    carte.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 10 });
  };

  const pleinEcran = async () => {
    if (!conteneurRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await conteneurRef.current.requestFullscreen();
    } catch {
      /* refus navigateur */
    }
  };

  return (
    <div
      ref={conteneurRef}
      className="relative h-full min-h-[420px] w-full overflow-hidden rounded-[18px] bg-surface"
    >
      <MapContainer
        ref={(instance) => setCarte(instance)}
        center={[14.3, -15.5]}
        zoom={7}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={theme}
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        {groupes.map((groupe) => (
          <Marker
            key={groupe.ville}
            position={groupe.position}
            icon={iconeGroupe(groupe.code, groupe.elements.length)}
            title={`${groupe.ville} · ${groupe.elements.length}`}
          >
            <Popup>
              <div className="w-[230px] font-sans">
                <p className="text-[11px] font-semibold text-ink">
                  {groupe.ville} · {groupe.elements.length}{' '}
                  {groupe.elements.length > 1 ? 'colis' : 'colis'}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {groupe.elements.slice(0, 5).map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-2">
                      <Link
                        to={`/colis/${c.numeroSuivi}`}
                        className="num text-[10.5px] font-semibold text-accent hover:underline"
                      >
                        {c.numeroSuivi}
                      </Link>
                      <span className="truncate text-[9.5px] text-ink-mute">
                        {c.destinataire.nom}
                      </span>
                    </li>
                  ))}
                </ul>
                {groupe.elements.length > 5 ? (
                  <p className="mt-1.5 text-[9px] text-ink-mute">
                    +{groupe.elements.length - 5} autres colis
                  </p>
                ) : null}
                <p className="mt-2 border-t border-line/10 pt-1.5 text-[9px] text-ink-mute">
                  Mise à jour {dateCourte(new Date().toISOString(), langue)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => carte?.zoomIn()}
          aria-label="Zoom avant"
          className="grid h-9 w-9 place-items-center rounded-full bg-shell/95 text-ink shadow-card ring-1 ring-line/10 backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => carte?.zoomOut()}
          aria-label="Zoom arrière"
          className="grid h-9 w-9 place-items-center rounded-full bg-shell/95 text-ink shadow-card ring-1 ring-line/10 backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={recadrer}
          aria-label="Recentrer la carte"
          className="grid h-9 w-9 place-items-center rounded-full bg-shell/95 text-ink shadow-card ring-1 ring-line/10 backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Scan className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={pleinEcran}
          aria-label={t('dash.plein_ecran')}
          className="grid h-9 w-9 place-items-center rounded-full bg-shell/95 text-ink shadow-card ring-1 ring-line/10 backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
