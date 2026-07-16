"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Day } from "@/lib/types";
import { entryCoords } from "@/lib/store";
import { CATEGORY_BY_KEY, PLACE_BY_ID } from "@/lib/seed";

function numberedIcon(n: number, color: string, highlighted: boolean) {
  return L.divIcon({
    className: "tb-pin",
    html: `<div style="background:${color};${
      highlighted ? "outline:3px solid #facc15;outline-offset:1px;" : ""
    }"><span>${n}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export default function MapInner({
  day,
  highlightEntryId,
}: {
  day: Day | undefined;
  highlightEntryId?: string | null;
}) {
  const resolved = useMemo(() => {
    if (!day) return [];
    return day.entries
      .map((e, i) => {
        const c = entryCoords(e);
        if (!c) return null;
        const cat =
          e.placeId !== undefined ? PLACE_BY_ID[e.placeId]?.category : undefined;
        const color = cat ? CATEGORY_BY_KEY[cat]?.color ?? "#334155" : "#334155";
        return { entry: e, order: i + 1, lat: c.lat, lng: c.lng, color };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [day]);

  const points = resolved.map((r) => [r.lat, r.lng] as [number, number]);

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
      <FitBounds points={points} />
      {points.length > 1 && (
        <Polyline
          positions={points}
          pathOptions={{ color: day?.color ?? "#334155", weight: 3, opacity: 0.6, dashArray: "6 8" }}
        />
      )}
      {resolved.map((r) => (
        <Marker
          key={r.entry.id}
          position={[r.lat, r.lng]}
          icon={numberedIcon(r.order, r.color, r.entry.id === highlightEntryId)}
        >
          <Popup>
            <strong>
              {r.order}. {r.entry.title}
            </strong>
            {r.entry.startTime && (
              <div style={{ marginTop: 2 }}>
                {r.entry.startTime}
                {r.entry.endTime ? `–${r.entry.endTime}` : ""}
              </div>
            )}
            {r.entry.note && <div style={{ marginTop: 2 }}>{r.entry.note}</div>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
