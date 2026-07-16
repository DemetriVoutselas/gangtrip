"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/types";
import { CATEGORY_BY_KEY } from "@/lib/seed";

export interface MarkerPoint {
  key: string;
  placeId: number;
  branchIndex: number;
  lat: number;
  lng: number;
  color: string;
  isBest: boolean;
  place: Place;
}

export interface RoutePoint {
  key: string;
  label: string;
  lat: number;
  lng: number;
}

function pinIcon(n: number, color: string, isBest: boolean, isSelected: boolean) {
  const outline = isSelected
    ? "outline:3px solid #2563eb;outline-offset:1px;"
    : isBest
      ? "outline:3px solid #facc15;outline-offset:1px;"
      : "";
  return L.divIcon({
    className: "tb-pin",
    html: `<div style="background:${color};${outline}"><span>${n}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

function PopupContent({
  m,
  branch,
  cat,
  isSelected,
  onToggleRoute,
  onRemovePlace,
}: {
  m: MarkerPoint;
  branch: Place["branches"][number] | undefined;
  cat: { name: string; color: string } | undefined;
  isSelected: boolean;
  onToggleRoute?: (p: RoutePoint) => void;
  onRemovePlace?: (id: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const p = m.place;
  const hasDetails = !!(p.famousFor || p.order || p.price || p.reservations || p.hours);

  return (
    <div style={{ minWidth: 180, maxWidth: 260 }}>
      <div style={{ fontWeight: 700 }}>
        {m.placeId}. {p.name}
      </div>
      <div style={{ fontSize: 11, color: cat?.color, fontWeight: 600 }}>
        {cat?.name}
        {m.isBest ? " · ★ best branch" : ""}
      </div>
      {branch && (
        <div style={{ fontSize: 12, marginTop: 4, color: "#64748b" }}>
          {branch.label} · {branch.neighborhood}
        </div>
      )}

      {p.flag && (
        <div
          style={{
            fontSize: 12,
            marginTop: 6,
            color: "#b45309",
            background: "#fffbeb",
            padding: "3px 5px",
            borderRadius: 4,
          }}
        >
          ⚠ {p.flag}
        </div>
      )}

      {hasDetails && showDetails && (
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
          {p.famousFor && <div style={{ fontSize: 12 }}>{p.famousFor}</div>}
          {p.order && (
            <div style={{ fontSize: 12 }}>
              <strong>Order:</strong> {p.order}
            </div>
          )}
          {p.price && (
            <div style={{ fontSize: 12 }}>
              <strong>Price:</strong> {p.price}
            </div>
          )}
          {p.reservations && (
            <div style={{ fontSize: 12 }}>
              <strong>Reservations:</strong> {p.reservations}
            </div>
          )}
          {p.hours && (
            <div style={{ fontSize: 12 }}>
              <strong>Hours:</strong> {p.hours}
            </div>
          )}
        </div>
      )}

      {hasDetails && (
        <button
          onClick={() => setShowDetails((v) => !v)}
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            background: "none",
            border: "none",
            padding: "4px 0 0",
            cursor: "pointer",
          }}
        >
          {showDetails ? "Less ▴" : "Details ▾"}
        </button>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button
          onClick={() =>
            onToggleRoute?.({ key: m.key, label: p.name, lat: m.lat, lng: m.lng })
          }
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid",
            borderColor: isSelected ? "#2563eb" : "#cbd5e1",
            background: isSelected ? "#2563eb" : "#fff",
            color: isSelected ? "#fff" : "#334155",
            cursor: "pointer",
          }}
        >
          {isSelected ? "✓ In route" : "+ Route"}
        </button>
        <button
          onClick={() => onRemovePlace?.(m.placeId)}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #fecaca",
            background: "#fff",
            color: "#dc2626",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function FitAll({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
  }, [map, points]);
  return null;
}

function FlyTo({ target }: { target: { lat: number; lng: number; k: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 0.6 });
  }, [map, target]);
  return null;
}

function FitRoute({ points }: { points: [number, number][] | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length === 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [80, 80], maxZoom: 15 });
    }
  }, [map, points]);
  return null;
}

function ClickCapture({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ExploreMapInner({
  markers,
  flyTarget,
  addMode = false,
  onMapClick,
  routePoints,
  selectedKeys = [],
  onToggleRoute,
  onRemovePlace,
}: {
  markers: MarkerPoint[];
  flyTarget: { lat: number; lng: number; k: number } | null;
  addMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  routePoints?: [number, number][];
  selectedKeys?: string[];
  onToggleRoute?: (p: RoutePoint) => void;
  onRemovePlace?: (id: number) => void;
}) {
  const points = useMemo(
    () => markers.map((m) => [m.lat, m.lng] as [number, number]),
    [markers]
  );

  return (
    <MapContainer
      center={[40.746, -73.985]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#e2e8f0", cursor: addMode ? "crosshair" : undefined }}
    >
      <TileLayer
        maxZoom={20}
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitAll points={points} />
      <FlyTo target={flyTarget} />
      <FitRoute points={routePoints} />
      <ClickCapture enabled={addMode} onClick={onMapClick} />

      {routePoints && routePoints.length === 2 && (
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85, dashArray: "6 8" }}
        />
      )}

      {markers.map((m) => {
        const p = m.place;
        const branch = p.branches[m.branchIndex];
        const cat = CATEGORY_BY_KEY[p.category];
        const isSelected = selectedKeys.includes(m.key);
        return (
          <Marker
            key={m.key}
            position={[m.lat, m.lng]}
            icon={pinIcon(m.placeId, m.color, m.isBest, isSelected)}
          >
            <Popup>
              <PopupContent
                m={m}
                branch={branch}
                cat={cat}
                isSelected={isSelected}
                onToggleRoute={onToggleRoute}
                onRemovePlace={onRemovePlace}
              />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
