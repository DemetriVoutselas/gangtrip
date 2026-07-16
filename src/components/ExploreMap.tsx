"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Fuse from "fuse.js";
import { categories, places, CATEGORY_BY_KEY } from "@/lib/seed";
import type { MarkerPoint } from "./ExploreMapInner";

const ExploreMapInner = dynamic(() => import("./ExploreMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center bg-slate-200 text-slate-500 text-sm">
      Loading map…
    </div>
  ),
});

const explorable = places.filter((p) => p.category !== "home");

const fuse = new Fuse(explorable, {
  keys: ["name", "famousFor", "branches.neighborhood", "branches.label"],
  threshold: 0.4,
  ignoreLocation: true,
});

export default function ExploreMap() {
  const [active, setActive] = useState<Set<string>>(
    () => new Set(categories.filter((c) => c.key !== "home").map((c) => c.key))
  );
  const [query, setQuery] = useState("");
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; k: number } | null>(
    null
  );
  const flyCounter = useRef(0);

  const filteredPlaces = useMemo(() => {
    const base = query.trim() ? fuse.search(query).map((r) => r.item) : explorable;
    return base.filter((p) => active.has(p.category));
  }, [query, active]);

  const markers: MarkerPoint[] = useMemo(() => {
    const out: MarkerPoint[] = [];
    for (const p of filteredPlaces) {
      const color = CATEGORY_BY_KEY[p.category]?.color ?? "#334155";
      p.branches.forEach((b, i) => {
        out.push({
          key: `${p.id}-${i}`,
          placeId: p.id,
          branchIndex: i,
          lat: b.lat,
          lng: b.lng,
          color,
          isBest: (p.bestBranchIndex ?? -1) === i,
          place: p,
        });
      });
    }
    return out;
  }, [filteredPlaces]);

  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of explorable) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, []);

  function toggleCat(key: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function focusPlace(lat: number, lng: number) {
    flyCounter.current += 1;
    setFlyTarget({ lat, lng, k: flyCounter.current });
  }

  const allOn = active.size === catCounts.size;

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="p-3 border-b border-slate-100">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, dishes, neighborhoods…"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">
              {filteredPlaces.length} of {explorable.length} places
            </span>
            <button
              onClick={() =>
                setActive(
                  allOn
                    ? new Set()
                    : new Set(categories.filter((c) => c.key !== "home").map((c) => c.key))
                )
              }
              className="text-xs text-blue-600 hover:underline"
            >
              {allOn ? "Hide all" : "Show all"}
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-slate-100 flex flex-wrap gap-1.5">
          {categories
            .filter((c) => c.key !== "home")
            .map((c) => {
              const on = active.has(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCat(c.key)}
                  className={`text-xs px-2 py-1 rounded-full border transition ${
                    on ? "text-white border-transparent" : "text-slate-500 border-slate-300"
                  }`}
                  style={on ? { background: c.color } : undefined}
                  title={c.name}
                >
                  {c.name.split(" ")[0]} ({catCounts.get(c.key) ?? 0})
                </button>
              );
            })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredPlaces.map((p) => {
            const color = CATEGORY_BY_KEY[p.category]?.color ?? "#334155";
            const b = p.branches[p.bestBranchIndex ?? 0];
            return (
              <button
                key={p.id}
                onClick={() => b && focusPlace(b.lat, b.lng)}
                className="w-full text-left px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: color }}
                  >
                    {p.id}
                  </span>
                  <span className="font-medium text-sm truncate">{p.name}</span>
                </div>
                {p.famousFor && (
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {p.famousFor}
                  </div>
                )}
              </button>
            );
          })}
          {filteredPlaces.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">No places match.</div>
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 min-w-0 relative">
        <ExploreMapInner markers={markers} flyTarget={flyTarget} />

        {/* Mobile category filter overlay */}
        <div className="lg:hidden absolute top-2 left-2 right-2 z-[500] bg-white/95 rounded-lg shadow p-2 flex gap-1.5 overflow-x-auto">
          {categories
            .filter((c) => c.key !== "home")
            .map((c) => {
              const on = active.has(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCat(c.key)}
                  className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
                    on ? "text-white border-transparent" : "text-slate-500 border-slate-300"
                  }`}
                  style={on ? { background: c.color } : undefined}
                >
                  {c.name.split(" ")[0]}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
