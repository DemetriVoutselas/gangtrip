"use client";

import Link from "next/link";
import { useTrip, entryCoords } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { haversineMeters, walkMinutes, formatDistance } from "@/lib/geo";
import TopNav from "@/components/TopNav";

export default function TripOverview() {
  const mounted = useMounted();
  const trip = useTrip((s) => s.trip);
  const homeBase = useTrip((s) => s.trip.homeBase);
  const setActiveDay = useTrip((s) => s.setActiveDay);

  return (
    <>
      <TopNav />
      {!mounted ? (
        <div className="grid place-items-center flex-1 text-slate-400">Loading…</div>
      ) : (
        <div className="max-w-3xl w-full mx-auto px-4 py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            <p className="text-slate-500 mt-1">
              Home base: {homeBase.label}. Tap a day to open the editable planner.
            </p>
            <Link
              href="/plan"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Open planner →
            </Link>
          </header>

          <div className="grid gap-3">
            {trip.days.map((d) => {
              let meters = 0;
              let prev: { lat: number; lng: number } | null = homeBase;
              for (const e of d.entries) {
                const c = entryCoords(e);
                if (c && prev) meters += haversineMeters(prev, c);
                if (c) prev = c;
              }
              const shortName = d.name.split("—")[1]?.trim() ?? d.name;
              return (
                <Link
                  key={d.id}
                  href="/plan"
                  onClick={() => setActiveDay(d.id)}
                  className="block p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-xs text-slate-400 font-medium">
                      Day {d.index}
                    </span>
                  </div>
                  <div className="font-semibold mt-0.5">{shortName}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {d.entries.length} stops · 🚶 {formatDistance(meters)} · ~
                    {walkMinutes(meters)} min walking
                  </div>
                  <div className="text-sm text-slate-400 mt-1 truncate">
                    {d.entries.map((e) => e.title).join(" • ")}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
