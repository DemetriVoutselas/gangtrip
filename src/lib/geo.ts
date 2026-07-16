const WALK_SPEED_KMH = 4.5;

/** Great-circle distance in meters between two lat/lng points. */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Estimated walking minutes for a given distance in meters. */
export function walkMinutes(meters: number): number {
  return Math.round((meters / 1000 / WALK_SPEED_KMH) * 60);
}

export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export interface Leg {
  meters: number;
  minutes: number;
  suggestSubway: boolean;
}

export function leg(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): Leg {
  const meters = haversineMeters(a, b);
  const minutes = walkMinutes(meters);
  return { meters, minutes, suggestSubway: meters > 1600 };
}

export type TransitMode = "walk" | "bus" | "subway" | "taxi";

export interface TransitOption {
  mode: TransitMode;
  label: string;
  icon: string;
  minutes: number;
}

export interface TransitSuggestion {
  meters: number;
  recommended: TransitMode;
  options: TransitOption[];
  detail: string;
}

const MODE_META: Record<TransitMode, { label: string; icon: string }> = {
  walk: { label: "Walk", icon: "🚶" },
  bus: { label: "Bus", icon: "🚌" },
  subway: { label: "Subway", icon: "🚇" },
  taxi: { label: "Taxi / rideshare", icon: "🚕" },
};

// Rough door-to-door minute estimates for NYC, including a little wait time.
const busMinutes = (m: number) => Math.round(5 + (m / 1000) * 4.6); // ~13 km/h w/ stops
const subwayMinutes = (m: number) => Math.round(8 + (m / 1000) * 2); // wait + ride + walk
const taxiMinutes = (m: number) => Math.round(6 + (m / 1000) * 3); // traffic-adjusted

/**
 * Suggest sensible ways to get between two points in the city, each with a
 * rough time estimate, and flag the recommended one. Thresholds are tuned for
 * dense Manhattan:
 *  - short hops are quickest on foot,
 *  - a couple of avenues/crosstown blocks suit the bus,
 *  - medium distances favour the subway,
 *  - long crosstown/outer-borough trips favour a cab/rideshare.
 * Estimates are straight-line heuristics, not real transit routing.
 */
export function transitSuggestion(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): TransitSuggestion {
  const meters = haversineMeters(a, b);

  const options: TransitOption[] = [];
  if (meters <= 3000)
    options.push({ mode: "walk", ...MODE_META.walk, minutes: walkMinutes(meters) });
  if (meters <= 12000)
    options.push({ mode: "bus", ...MODE_META.bus, minutes: busMinutes(meters) });
  if (meters > 800)
    options.push({ mode: "subway", ...MODE_META.subway, minutes: subwayMinutes(meters) });
  options.push({ mode: "taxi", ...MODE_META.taxi, minutes: taxiMinutes(meters) });

  let recommended: TransitMode;
  if (meters <= 1200) recommended = "walk";
  else if (meters <= 3000) recommended = "bus";
  else if (meters <= 8000) recommended = "subway";
  else recommended = "taxi";

  const rec = options.find((o) => o.mode === recommended) ?? options[0];
  const detail = `~${rec.minutes} min by ${rec.label.toLowerCase()}`;

  return { meters, recommended: rec.mode, options, detail };
}
