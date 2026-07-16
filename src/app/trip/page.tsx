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
        <div className="max-w-3xl w-full mx-auto px-5 py-12">
          <header className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              {trip.title}
            </h1>
            <p className="text-slate-500 mt-2">
              Home base: {homeBase.label}. Tap a day to open the editable planner.
            </p>
            <Link
              href="/plan"
              className="inline-block mt-5 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Open planner →
            </Link>
          </header>

          <div className="grid gap-2.5">
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
                  className="block p-5 rounded-2xl bg-white border border-black/5 shadow-sm shadow-slate-900/[0.03] hover:shadow-md hover:shadow-slate-900/[0.06] transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      Day {d.index}
                    </span>
                  </div>
                  <div className="font-semibold text-lg tracking-tight mt-1 text-slate-900">
                    {shortName}
                  </div>
                  <div className="text-sm text-slate-500 mt-1.5">
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
