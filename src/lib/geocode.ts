/**
 * Lightweight place search (geocoding) backed by Photon, a free, keyless
 * geocoder built on OpenStreetMap data (same source as the map tiles).
 * No API key or billing required. Results are biased toward NYC.
 *
 * Docs: https://photon.komoot.io — data © OpenStreetMap contributors.
 */

export interface GeocodeResult {
  name: string; // primary label for the place name field
  label: string; // fuller address string for the dropdown
  lat: number;
  lng: number;
}

// Rough Manhattan centroid, used to bias results toward the trip area.
const BIAS_LAT = 40.758;
const BIAS_LNG = -73.9855;

interface PhotonProps {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProps;
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<GeocodeResult[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("lat", String(BIAS_LAT));
  url.searchParams.set("lon", String(BIAS_LNG));
  url.searchParams.set("limit", "6");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = (await res.json()) as { features?: PhotonFeature[] };

  const out: GeocodeResult[] = [];
  for (const f of data.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!coords) continue;
    const [lng, lat] = coords;
    const p = f.properties ?? {};
    const street = [p.housenumber, p.street].filter(Boolean).join(" ");
    const parts = [p.name, street, p.city ?? p.town ?? p.village, p.state].filter(
      (x): x is string => Boolean(x)
    );
    if (parts.length === 0) continue;
    const label = parts.join(", ");
    out.push({ name: p.name || parts[0], label, lat, lng });
  }
  return out;
}
