"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

function pinIcon(n: number, color: string, isBest: boolean) {
  return L.divIcon({
    className: "tb-pin",
    html: `<div style="background:${color};${
      isBest ? "outline:3px solid #facc15;outline-offset:1px;" : ""
    }"><span>${n}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
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

export default function ExploreMapInner({
  markers,
  flyTarget,
}: {
  markers: MarkerPoint[];
  flyTarget: { lat: number; lng: number; k: number } | null;
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
      style={{ background: "#e2e8f0" }}
    >
      <TileLayer
        maxZoom={20}
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitAll points={points} />
      <FlyTo target={flyTarget} />
      {markers.map((m) => {
        const p = m.place;
        const branch = p.branches[m.branchIndex];
        const cat = CATEGORY_BY_KEY[p.category];
        return (
          <Marker
            key={m.key}
            position={[m.lat, m.lng]}
            icon={pinIcon(m.placeId, m.color, m.isBest)}
          >
            <Popup>
              <div style={{ minWidth: 180, maxWidth: 260 }}>
                <div style={{ fontWeight: 700 }}>
                  {m.placeId}. {p.name}
                </div>
                <div style={{ fontSize: 11, color: cat?.color, fontWeight: 600 }}>
                  {cat?.name}
                  {m.isBest ? " · ★ best branch" : ""}
                </div>
                {branch && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {branch.label} · {branch.neighborhood}
                  </div>
                )}
                {p.famousFor && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>{p.famousFor}</div>
                )}
                {p.order && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <strong>Order:</strong> {p.order}
                  </div>
                )}
                {p.price && (
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    <strong>Price:</strong> {p.price}
                  </div>
                )}
                {p.reservations && (
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    <strong>Reservations:</strong> {p.reservations}
                  </div>
                )}
                {p.hours && (
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    <strong>Hours:</strong> {p.hours}
                  </div>
                )}
                {p.flag && (
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: "#b45309",
                      background: "#fffbeb",
                      padding: "3px 5px",
                      borderRadius: 4,
                    }}
                  >
                    ⚠ {p.flag}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
