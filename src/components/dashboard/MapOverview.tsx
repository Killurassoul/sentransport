import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Maximize2, Minus, Plus } from 'lucide-react';
import type { Colis } from '@/api/types';
import { STATUTS, codeVille, villeParNom } from '@/lib/constants';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { nombre } from '@/lib/format';

type Coordonnees = [number, number];

function genererItineraire(
  depart: Coordonnees,
  arrivee: Coordonnees,
  points = 30,
): Coordonnees[] {
  const [lat1, lng1] = depart;
  const [lat2, lng2] = arrivee;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const courbure = 0.14;
  return Array.from({ length: points }, (_, index) => {
    const t = index / (points - 1);
    const offset = Math.sin(t * Math.PI) * courbure;
    return [
      lat1 + dLat * t - dLng * offset,
      lng1 + dLng * t + dLat * offset,
    ] as Coordonnees;
  });
}

function interpoler(positions: Coordonnees[], fraction: number): Coordonnees {
  if (positions.length === 0) return [14.7, -17.4];
  const valeur = Math.min(1, Math.max(0, fraction)) * (positions.length - 1);
  const bas = Math.floor(valeur);
  const haut = Math.min(positions.length - 1, bas + 1);
  const t = valeur - bas;
  const a = positions[bas] as Coordonnees;
  const b = positions[haut] as Coordonnees;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function iconePill(code: string, accent = false) {
  return L.divIcon({
    className: 'map-pill-marker',
    html: `<span class="map-pill ${accent ? 'map-pill--accent' : ''}"><span class="map-pill__dot">${accent ? 'B' : 'A'}</span>${code}</span>`,
    iconSize: [74, 28],
    iconAnchor: [37, 14],
  });
}

const ICONE_CAMION = L.divIcon({
  className: 'map-truck-marker',
  html: `<span class="map-truck"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6H3v12h11Z"/><path d="M14 12h4l4 4v2h-8Z"/><circle cx="7.5" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg></span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function AjusterVue({ positions }: { positions: Coordonnees[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    // Le conteneur peut être mesuré après le premier rendu (grille responsive).
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(positions), {
      padding: [42, 42],
      animate: false,
      maxZoom: 10,
    });
  }, [map, positions]);
  return null;
}

function CamionAnime({
  positions,
  fraction,
}: {
  positions: Coordonnees[];
  fraction: number;
}) {
  const markerRef = useRef<L.Marker>(null);
  const reduit = useReducedMotion();
  const cible = interpoler(positions, fraction);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || positions.length === 0) return;
    if (reduit) {
      marker.setLatLng(interpoler(positions, fraction));
      return;
    }
    let frame = 0;
    const debut = performance.now();
    const tick = (maintenant: number) => {
      const progression = Math.min(1, (maintenant - debut) / 2400);
      const adouci = 1 - Math.pow(1 - progression, 3);
      marker.setLatLng(interpoler(positions, fraction * adouci));
      if (progression < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [positions, fraction, reduit]);

  return (
    <Marker ref={markerRef} position={cible} icon={ICONE_CAMION} zIndexOffset={600} />
  );
}

export function MapOverview({
  colis,
  className,
  afficherEntete = true,
  hauteur = 'min-h-[300px]',
}: {
  colis?: Colis;
  className?: string;
  afficherEntete?: boolean;
  hauteur?: string;
}) {
  const { t, langue } = useI18n();
  const theme = useUIStore((s) => s.theme);
  const [carte, setCarte] = useState<L.Map | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const { positions, depart, arrivee } = useMemo(() => {
    const villeDepart = villeParNom(colis?.villeDepart ?? 'Dakar');
    const villeArrivee = villeParNom(colis?.villeArrivee ?? 'Thiès');
    const a: Coordonnees = [villeDepart?.lat ?? 14.7167, villeDepart?.lng ?? -17.4677];
    const b: Coordonnees = [villeArrivee?.lat ?? 14.7886, villeArrivee?.lng ?? -16.9246];
    return { positions: genererItineraire(a, b), depart: a, arrivee: b };
  }, [colis?.villeDepart, colis?.villeArrivee]);

  const iconeDepart = useMemo(
    () => iconePill(colis ? codeVille(colis.villeDepart) : 'DKR'),
    [colis],
  );
  const iconeArrivee = useMemo(
    () => iconePill(colis ? codeVille(colis.villeArrivee) : 'THS', true),
    [colis],
  );

  const fraction = colis ? STATUTS[colis.statut].progression / 100 : 0.72;

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

  const pleinEcran = async () => {
    if (!conteneurRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await conteneurRef.current.requestFullscreen();
      }
    } catch {
      /* Le plein écran peut être refusé par le navigateur. */
    }
  };

  return (
    <section
      className={`surface-card flex h-full flex-col overflow-hidden ${className ?? ''}`}
      aria-label={t('dash.carte')}
    >
      {afficherEntete ? (
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">{t('dash.carte')}</h2>
            <p className="mt-0.5 text-[11px] text-ink-mute">
              {colis?.villeDepart ?? 'Dakar'} → {colis?.villeArrivee ?? 'Thiès'}
            </p>
          </div>
          <Link
            to="/carte"
            aria-label={t('dash.voir_carte')}
            className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-shell hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </header>
      ) : null}

      <div
        ref={conteneurRef}
        className={`relative mx-2 mb-2 flex-1 overflow-hidden rounded-[16px] bg-surface ${hauteur}`}
      >
        <MapContainer
          ref={(instance) => setCarte(instance)}
          center={depart}
          zoom={8}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={theme}
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
          <AjusterVue positions={positions} />
          <Polyline
            positions={positions}
            pathOptions={{
              color: theme === 'dark' ? '#4B3F7A' : '#D7CDFB',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
            }}
          />
          <Polyline
            positions={positions}
            pathOptions={{
              color: theme === 'dark' ? '#8F75FF' : '#7C5CFC',
              weight: 3,
              dashArray: '1 8',
              lineCap: 'round',
              className: 'route-pointillee',
            }}
          />
          <Marker position={depart} icon={iconeDepart} title={colis?.villeDepart ?? 'Dakar'} />
          <Marker position={arrivee} icon={iconeArrivee} title={colis?.villeArrivee ?? 'Thiès'} />
          <CamionAnime positions={positions} fraction={fraction} />
        </MapContainer>

        <div className="absolute bottom-3 left-3 z-[500] inline-flex items-center gap-2 rounded-pill bg-shell/95 px-3 py-1.5 text-[11px] font-medium text-ink shadow-card ring-1 ring-line/10 backdrop-blur">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" />
          {t('dash.trajet_en_cours')}
          <span className="num text-ink-mute">
            {nombre(colis?.distanceKm ?? 70, langue)} km
          </span>
        </div>

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
            onClick={pleinEcran}
            aria-label={t('dash.plein_ecran')}
            className="grid h-9 w-9 place-items-center rounded-full bg-shell/95 text-ink shadow-card ring-1 ring-line/10 backdrop-blur transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
