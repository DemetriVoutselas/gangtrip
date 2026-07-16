"use client";

import type { Day } from "@/lib/types";
import { entryCoords, useTrip } from "@/lib/store";
import { haversineMeters, walkMinutes, formatDistance } from "@/lib/geo";

export default function DaySummary({ day }: { day: Day }) {
  const homeBase = useTrip((s) => s.trip.homeBase);

  let meters = 0;
  let prev: { lat: number; lng: number } | null = homeBase;
  const mealSet = new Set<string>();
  for (const e of day.entries) {
    const c = entryCoords(e);
    if (c && prev) meters += haversineMeters(prev, c);
    if (c) prev = c;
    mealSet.add(e.slot);
  }

  const stops = day.entries.length;
  const done = day.entries.filter((e) => e.done).length;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
      <span>
        <strong className="text-slate-700">{stops}</strong> stops
      </span>
      <span>
        <strong className="text-slate-700">{done}</strong> done
      </span>
      <span>
        🚶 <strong className="text-slate-700">{formatDistance(meters)}</strong> · ~
        {walkMinutes(meters)} min walking
      </span>
      <span>
        <strong className="text-slate-700">{mealSet.size}</strong> slot types
      </span>
    </div>
  );
}
