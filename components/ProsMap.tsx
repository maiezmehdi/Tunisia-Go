'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import type { DirectoryPro, DirectoryLabels } from '@/components/ProsDirectory';
import { TUNISIA_CENTER } from '@/data/tunisiaData';
import { TILE_URL } from '@/lib/tiles';

/** A round photo (or the person's initial) as a map pin. Built with DOM nodes: names are never put in HTML strings. */
function pinIcon(pro: DirectoryPro): L.DivIcon {
  const el = document.createElement('div');
  el.className =
    'flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-charcoal font-serif text-lg text-cream shadow-soft';
  if (pro.photoUrl) {
    const img = document.createElement('img');
    img.src = pro.photoUrl;
    img.alt = '';
    img.className = 'h-full w-full object-cover';
    el.appendChild(img);
  } else {
    el.textContent = pro.name.trim().charAt(0).toUpperCase();
  }
  return L.divIcon({ html: el, className: '', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22] });
}

function FitToPins({ pros }: { pros: DirectoryPro[] }) {
  const map = useMap();
  useEffect(() => {
    const points = pros.filter((p) => p.coords).map((p) => p.coords as [number, number]);
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 10 });
  }, [pros, map]);
  return null;
}

/** Guides and agencies on the map, each at the place where they work, with their photo. */
export default function ProsMap({ pros, labels }: { pros: DirectoryPro[]; labels: DirectoryLabels }) {
  const placed = pros.filter((p) => p.coords);
  return (
    <MapContainer
      center={TUNISIA_CENTER}
      zoom={7}
      minZoom={5}
      maxZoom={16}
      className="h-full w-full"
      maxBounds={[
        [28.5, 4.5],
        [39.5, 14.5],
      ]}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={TILE_URL}
      />
      <FitToPins pros={placed} />
      {placed.map((p) => (
        <Marker key={p.id} position={p.coords as [number, number]} icon={pinIcon(p)} title={p.name}>
          <Popup>
            <div className="w-56">
              <p className="text-[11px] uppercase tracking-[0.14em] text-charcoal-300">{labels[p.kind]}</p>
              <p className="mt-0.5 font-serif text-xl leading-tight text-charcoal">{p.name}</p>
              {p.placeName && <p className="mt-0.5 text-xs text-charcoal-500">{p.placeName}</p>}
              {p.cardDeclared && <p className="mt-1 text-xs text-charcoal-700">{labels.declared}</p>}
              {p.bio && <p className="mt-2 line-clamp-4 text-sm leading-snug text-charcoal-700">{p.bio}</p>}
              {p.whatsappUrl && (
                <a
                  href={p.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-pill bg-charcoal px-3.5 py-1.5 text-xs text-cream"
                >
                  {labels.contact}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
