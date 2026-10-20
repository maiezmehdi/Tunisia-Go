'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';

import { PLACE_BY_ID, TUNISIA_CENTER } from '@/data/tunisiaData';
import type { CategoryId, Itinerary, LatLng, Place } from '@/data/types';
import { TILE_URL } from '@/lib/tiles';

export interface InteractiveMapProps {
  places: Place[];
  activeCategories: ReadonlySet<CategoryId>;
  selectedId: string | null;
  itinerary: Itinerary | null;
  onSelect: (placeId: string) => void;
  /** Change this value whenever the map container is resized (e.g. view mode toggle). */
  layoutKey?: string;
  /** Small static maps (the printed road trip): even margins, a wider view of a single stop, no zoom buttons. */
  still?: boolean;
}

interface PinOptions {
  active: boolean;
  dim: boolean;
  stopNumber?: number;
}

function pinIcon({ active, dim, stopNumber }: PinOptions): L.DivIcon {
  const classes = ['tg-pin', stopNumber && 'is-stop', active && 'is-active', dim && 'is-dim'].filter(Boolean).join(' ');
  const size = stopNumber ? 26 : 16;
  return L.divIcon({
    className: 'tg-marker',
    html: `<div class="${classes}">${stopNumber ?? ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2 - 4],
  });
}

/** Imperative camera moves: fly to the selected place, fit an itinerary, react to resizes. */
function MapController({
  selected,
  frameCoords,
  frameIsRoute,
  layoutKey,
  still,
}: {
  selected: Place | null;
  /** Points to keep in frame: the itinerary route, or every visible marker. */
  frameCoords: LatLng[];
  frameIsRoute: boolean;
  layoutKey?: string;
  still?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize({ pan: false }), 350);
    return () => window.clearTimeout(t);
  }, [layoutKey, map]);

  const frameKey = frameCoords.map((c) => c.join(',')).join('|');
  const isFirstFrame = useRef(true);
  useEffect(() => {
    if (frameCoords.length === 0) return;
    const bounds = L.latLngBounds(frameCoords);
    // On wide screens the open circuit panel covers the bottom-left: keep the route clear of it.
    const leftInset = frameIsRoute && map.getSize().x >= 900 ? 440 : 48;
    const options: L.FitBoundsOptions = still
      ? { padding: [40, 40], maxZoom: frameCoords.length === 1 ? 7 : 9 }
      : {
          paddingTopLeft: [leftInset, 48],
          paddingBottomRight: [48, 140],
          maxZoom: frameCoords.length === 1 ? 10 : 9,
        };
    // Still maps jump straight to the frame, so a print never catches them mid-flight.
    if (isFirstFrame.current || still) {
      isFirstFrame.current = false;
      map.fitBounds(bounds, options);
      return;
    }
    // Debounced so quick successive filter clicks end on the last framing.
    const t = window.setTimeout(() => {
      map.stop();
      map.flyToBounds(bounds, { ...options, duration: 1 });
    }, 120);
    return () => window.clearTimeout(t);
    // frameKey captures frameCoords content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey, map]);

  useEffect(() => {
    if (!selected) return;
    const zoom = Math.max(map.getZoom(), 9);
    // The drawer covers the right of the map on larger screens: centre the place in what stays visible.
    const container = map.getSize();
    const drawerWidth = container.x >= 900 ? 460 : 0;
    const point = map.project(selected.coords, zoom).add([drawerWidth / 2, 60]);
    map.flyTo(map.unproject(point, zoom), zoom, { duration: 0.9 });
  }, [selected, map]);

  return null;
}

export default function InteractiveMap({
  places,
  activeCategories,
  selectedId,
  itinerary,
  onSelect,
  layoutKey,
  still = false,
}: InteractiveMapProps) {
  const stopOrder = useMemo(() => {
    const order = new Map<string, number>();
    itinerary?.stops.forEach((id, i) => order.set(id, i + 1));
    return order;
  }, [itinerary]);

  const routeCoords = useMemo<LatLng[]>(() => {
    if (!itinerary) return [];
    // Community places are not in the static catalog: look in the places on the map first.
    const byId = new Map(places.map((p) => [p.id, p]));
    return itinerary.stops.map((id) => (byId.get(id) ?? PLACE_BY_ID[id])?.coords).filter((c): c is LatLng => !!c);
  }, [itinerary, places]);

  const visible = useMemo(
    () => places.filter((p) => activeCategories.has(p.category) || stopOrder.has(p.id)),
    [places, activeCategories, stopOrder],
  );

  const selected = selectedId ? (places.find((p) => p.id === selectedId) ?? PLACE_BY_ID[selectedId] ?? null) : null;

  return (
    <MapContainer
      center={TUNISIA_CENTER}
      zoom={7}
      minZoom={5}
      maxZoom={16}
      zoomControl={false}
      dragging={!still}
      scrollWheelZoom={!still}
      doubleClickZoom={!still}
      keyboard={!still}
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
      {!still && <ZoomControlBottomRight />}

      {routeCoords.length > 1 && itinerary && (
        <>
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#1A1A1A', weight: 2, opacity: 0.85, dashArray: '1 7', lineCap: 'round' }}
          />
        </>
      )}

      {visible.map((place) => {
        const stopNumber = stopOrder.get(place.id);
        return (
          <Marker
            key={place.id}
            position={place.coords}
            icon={pinIcon({ active: place.id === selectedId, dim: !!itinerary && !stopNumber, stopNumber })}
            zIndexOffset={place.id === selectedId ? 1000 : stopNumber ? 500 : 0}
            eventHandlers={{ click: () => onSelect(place.id) }}
            keyboard
            title={place.name}
          >
            <Tooltip direction="top" className="tg-tooltip" opacity={1}>
              {place.name}
            </Tooltip>
          </Marker>
        );
      })}

      <MapController
        selected={selected}
        frameCoords={routeCoords.length > 1 ? routeCoords : visible.map((p) => p.coords)}
        frameIsRoute={routeCoords.length > 1}
        layoutKey={layoutKey}
        still={still}
      />
    </MapContainer>
  );
}

function ZoomControlBottomRight() {
  const map = useMap();
  useEffect(() => {
    const control = L.control.zoom({ position: 'bottomright' });
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);
  return null;
}
