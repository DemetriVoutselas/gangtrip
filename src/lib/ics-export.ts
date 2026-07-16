import { createEvents, type EventAttributes } from "ics";
import type { Trip } from "./types";
import { PLACE_BY_ID } from "./seed";

function parseHHMM(t?: string): [number, number] | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

/** Build an .ics string with one event per timed entry. */
export function tripToICS(trip: Trip): string | null {
  const events: EventAttributes[] = [];

  for (const day of trip.days) {
    if (!day.date) continue;
    const [y, mo, d] = day.date.split("-").map((n) => parseInt(n, 10));
    if (!y || !mo || !d) continue;

    for (const entry of day.entries) {
      const start = parseHHMM(entry.startTime);
      if (!start) continue; // only export timed entries

      const place = entry.placeId !== undefined ? PLACE_BY_ID[entry.placeId] : undefined;
      const branch =
        place && entry.branchIndex !== undefined
          ? place.branches[entry.branchIndex]
          : undefined;

      const end = parseHHMM(entry.endTime);
      const descParts = [entry.note, place?.order && `Order: ${place.order}`].filter(
        Boolean
      );

      const ev: EventAttributes = {
        title: entry.title,
        start: [y, mo, d, start[0], start[1]],
        ...(end ? { end: [y, mo, d, end[0], end[1]] } : { duration: { hours: 1 } }),
        location: branch?.label,
        description: descParts.join("\n") || undefined,
        geo: branch ? { lat: branch.lat, lon: branch.lng } : undefined,
      };
      events.push(ev);
    }
  }

  if (events.length === 0) return null;
  const { error, value } = createEvents(events);
  if (error) {
    console.error("ICS export error", error);
    return null;
  }
  return value ?? null;
}

export function downloadICS(trip: Trip) {
  const ics = tripToICS(trip);
  if (!ics) {
    alert("Add start times to entries to export a calendar.");
    return;
  }
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tripboard.ics";
  a.click();
  URL.revokeObjectURL(url);
}
