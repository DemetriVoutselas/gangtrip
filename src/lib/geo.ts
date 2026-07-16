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

export type TransitMode = "walk" | "subway" | "taxi";

export interface TransitSuggestion {
  mode: TransitMode;
  label: string;
  icon: string;
  meters: number;
  walkMinutes: number;
  estMinutes: number;
  detail: string;
}

/**
 * Suggest the most sensible way to get between two points in the city,
 * with a rough time estimate. Thresholds are tuned for dense Manhattan:
 *  - short hops are quickest on foot,
 *  - medium distances favour the subway,
 *  - long crosstown/outer-borough trips favour a cab/rideshare.
 */
export function transitSuggestion(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): TransitSuggestion {
  const meters = haversineMeters(a, b);
  const wMin = walkMinutes(meters);

  if (meters <= 1200) {
    return {
      mode: "walk",
      label: "Walk",
      icon: "🚶",
      meters,
      walkMinutes: wMin,
      estMinutes: wMin,
      detail: `~${wMin} min on foot`,
    };
  }

  if (meters <= 8000) {
    // wait + ride + short walk to/from stations
    const est = Math.round(8 + (meters / 1000) * 2);
    return {
      mode: "subway",
      label: "Subway",
      icon: "🚇",
      meters,
      walkMinutes: wMin,
      estMinutes: est,
      detail: `~${est} min by subway (vs ~${wMin} min walking)`,
    };
  }

  const taxi = Math.round(6 + (meters / 1000) * 3);
  return {
    mode: "taxi",
    label: "Taxi / rideshare",
    icon: "🚕",
    meters,
    walkMinutes: wMin,
    estMinutes: taxi,
    detail: `~${taxi} min by cab (walking not practical)`,
  };
}
