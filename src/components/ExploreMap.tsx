"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Fuse from "fuse.js";
import { categories, places, CATEGORY_BY_KEY } from "@/lib/seed";
import { useExplore } from "@/lib/explore-store";
import { useMounted } from "@/lib/useMounted";
import { transitSuggestion, formatDistance } from "@/lib/geo";
import { searchPlaces, type GeocodeResult } from "@/lib/geocode";
import type { Place } from "@/lib/types";
import type { MarkerPoint, RoutePoint } from "./ExploreMapInner";

const ExploreMapInner = dynamic(() => import("./ExploreMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center bg-slate-200 text-slate-500 text-sm">
      Loading map…
    </div>
  ),
});

const seedExplorable = places.filter((p) => p.category !== "home");
const explorableCategories = categories.filter((c) => c.key !== "home");
const DEFAULT_CATEGORY = explorableCategories[0]?.key ?? "act";

interface AddForm {
  name: string;
  category: string;
  lat: string;
  lng: string;
}

const BLANK_FORM: AddForm = { name: "", category: DEFAULT_CATEGORY, lat: "", lng: "" };

// Shared place-list rows, reused by the desktop sidebar and the mobile sheet.
// A real component (not a render-time helper) so `onPick`/`onRemove` stay plain
// event-handler props rather than callbacks touched during render.
function PlaceListRows({
  places,
  route,
  onPick,
  onRemove,
}: {
  places: Place[];
  route: RoutePoint[];
  onPick: (p: Place) => void;
  onRemove: (id: number) => void;
}) {
  if (places.length === 0) {
    return <div className="p-8 text-center text-sm text-slate-400">No places match.</div>;
  }
  return (
    <>
      {places.map((p) => {
        const color = CATEGORY_BY_KEY[p.category]?.color ?? "#334155";
        const bi = p.bestBranchIndex ?? 0;
        const selIndex = route.findIndex((r) => r.key === `${p.id}-${bi}`);
        const isSel = selIndex !== -1;
        return (
          <div
            key={p.id}
            className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl transition-colors ${
              isSel ? "bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            <button
              onClick={() => onPick(p)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <span
                className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
                style={{ background: color }}
              >
                {p.id}
              </span>
              <span className="min-w-0">
                <span className="font-medium text-sm truncate block text-slate-800">
                  {p.name}
                </span>
              </span>
            </button>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {isSel && (
                <span className="text-[10px] font-bold text-blue-600">
                  {selIndex === 0 ? "A" : "B"}
                </span>
              )}
              <button
                onClick={() => onRemove(p.id)}
                title="Remove from map"
                className="text-slate-300 hover:text-red-500 text-sm leading-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function ExploreMap() {
  const mounted = useMounted();
  const customPlaces = useExplore((s) => s.customPlaces);
  const hiddenPlaceIds = useExplore((s) => s.hiddenPlaceIds);
  const addPlace = useExplore((s) => s.addPlace);
  const removePlace = useExplore((s) => s.removePlace);
  const restoreHidden = useExplore((s) => s.restoreHidden);

  const [active, setActive] = useState<Set<string>>(
    () => new Set(explorableCategories.map((c) => c.key))
  );
  const [query, setQuery] = useState("");
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; k: number } | null>(
    null
  );
  const flyCounter = useRef(0);

  // Route selection (up to two points) for transit suggestions.
  const [route, setRoute] = useState<RoutePoint[]>([]);

  // Add-a-location mode + draft form.
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);

  // Place search (geocoding) for the add-location form.
  const [geoQuery, setGeoQuery] = useState("");
  const [geoResults, setGeoResults] = useState<GeocodeResult[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  // Pending removal awaiting confirmation.
  const [pendingRemoval, setPendingRemoval] = useState<{ id: number; name: string } | null>(
    null
  );

  // Progressive-disclosure + collapse state for a calmer UI.
  const [manualEntry, setManualEntry] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllModes, setShowAllModes] = useState(false);

  // Mobile bottom sheet (the place list on phones). It snaps between a small
  // "peek" and a fully-expanded state, and can be dragged by its grabber.
  const SHEET_PEEK = 84; // px visible when collapsed
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sheetDrag, setSheetDrag] = useState(0); // live px offset while dragging
  const [sheetDragging, setSheetDragging] = useState(false);
  const sheetDragStart = useRef<{ pointer: number; base: number } | null>(null);

  // Merge seed + custom, minus hidden. Only after mount so SSR and the first
  // client render agree (persisted state hydrates post-mount).
  const basePlaces = useMemo(
    () => (mounted ? [...seedExplorable, ...customPlaces] : seedExplorable),
    [mounted, customPlaces]
  );
  const hidden = useMemo(
    () => (mounted ? new Set(hiddenPlaceIds) : new Set<number>()),
    [mounted, hiddenPlaceIds]
  );
  const visiblePlaces = useMemo(
    () => basePlaces.filter((p) => !hidden.has(p.id)),
    [basePlaces, hidden]
  );

  const fuse = useMemo(
    () =>
      new Fuse(visiblePlaces, {
        keys: ["name", "famousFor", "branches.neighborhood", "branches.label"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [visiblePlaces]
  );

  const filteredPlaces = useMemo(() => {
    const base = query.trim() ? fuse.search(query).map((r) => r.item) : visiblePlaces;
    return base.filter((p) => active.has(p.category));
  }, [query, active, fuse, visiblePlaces]);

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
    for (const p of visiblePlaces) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [visiblePlaces]);

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

  function toggleRoute(pt: RoutePoint) {
    setShowAllModes(false);
    setRoute((r) => {
      const exists = r.some((x) => x.key === pt.key);
      if (exists) return r.filter((x) => x.key !== pt.key);
      if (r.length >= 2) return [pt];
      return [...r, pt];
    });
  }

  function selectPlaceForRoute(p: (typeof visiblePlaces)[number]) {
    const bi = p.bestBranchIndex ?? 0;
    const b = p.branches[bi];
    if (!b) return;
    toggleRoute({ key: `${p.id}-${bi}`, label: p.name, lat: b.lat, lng: b.lng });
    focusPlace(b.lat, b.lng);
  }

  function requestRemovePlace(id: number) {
    const p = basePlaces.find((x) => x.id === id);
    setPendingRemoval({ id, name: p?.name ?? "this location" });
  }

  function confirmRemovePlace() {
    if (!pendingRemoval) return;
    const { id } = pendingRemoval;
    removePlace(id);
    setRoute((r) => r.filter((pt) => Number(pt.key.split("-")[0]) !== id));
    setPendingRemoval(null);
  }

  function handleMapClick(lat: number, lng: number) {
    if (!addMode) return;
    setForm((f) => ({ ...f, lat: lat.toFixed(5), lng: lng.toFixed(5) }));
  }

  // Debounced geocoding search while adding a location.
  useEffect(() => {
    const q = geoQuery.trim();
    if (!addMode || q.length < 3) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then((r) => {
          if (active) setGeoResults(r);
        })
        .catch(() => {
          if (active) setGeoResults([]);
        })
        .finally(() => {
          if (active) setGeoLoading(false);
        });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [geoQuery, addMode]);

  function resetGeo() {
    setGeoQuery("");
    setGeoResults([]);
    setGeoLoading(false);
    setManualEntry(false);
  }

  // Measure the mobile sheet so we can translate it precisely between snaps.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const update = () => setSheetHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  const sheetCollapsedOffset = Math.max(0, sheetHeight - SHEET_PEEK);
  const sheetBaseOffset = sheetExpanded ? 0 : sheetCollapsedOffset;
  const sheetOffset =
    sheetHeight === 0
      ? 1000 // not measured yet — park off-screen, then slide up to the peek
      : sheetDragging
        ? Math.min(sheetCollapsedOffset, Math.max(0, sheetBaseOffset + sheetDrag))
        : sheetBaseOffset;

  function onSheetGrabStart(e: React.PointerEvent) {
    sheetDragStart.current = { pointer: e.clientY, base: sheetBaseOffset };
    setSheetDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onSheetGrabMove(e: React.PointerEvent) {
    if (!sheetDragStart.current) return;
    setSheetDrag(e.clientY - sheetDragStart.current.pointer);
  }
  function onSheetGrabEnd() {
    if (!sheetDragStart.current) return;
    const final = Math.min(
      sheetCollapsedOffset,
      Math.max(0, sheetDragStart.current.base + sheetDrag)
    );
    setSheetExpanded(final < sheetCollapsedOffset / 2);
    setSheetDragging(false);
    setSheetDrag(0);
    sheetDragStart.current = null;
  }

  function pickGeoResult(r: GeocodeResult) {
    setForm((f) => ({
      ...f,
      name: r.name,
      lat: r.lat.toFixed(5),
      lng: r.lng.toFixed(5),
    }));
    focusPlace(r.lat, r.lng);
    resetGeo();
  }

  function submitAdd() {
    const latN = parseFloat(form.lat);
    const lngN = parseFloat(form.lng);
    if (!form.name.trim() || Number.isNaN(latN) || Number.isNaN(lngN)) return;
    addPlace({ name: form.name.trim(), category: form.category, lat: latN, lng: lngN });
    focusPlace(latN, lngN);
    setForm(BLANK_FORM);
    resetGeo();
    setAddMode(false);
  }

  const allOn = active.size === explorableCategories.length;
  const routeLine =
    route.length === 2
      ? (route.map((p) => [p.lat, p.lng]) as [number, number][])
      : undefined;
  const selectedKeys = route.map((p) => p.key);
  const suggestion = route.length === 2 ? transitSuggestion(route[0], route[1]) : null;

  // Reveal the detail fields only once there's something to show (a picked
  // result, a map click, or an explicit "enter manually").
  const showDetails = manualEntry || !!form.name || !!form.lat || !!form.lng;

  // Shared category-filter body used by both the desktop panel and the mobile
  // popover, so filtering lives behind one control instead of a permanent row.
  const filterPanelBody = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Categories
        </span>
        <button
          onClick={() =>
            setActive(
              allOn ? new Set() : new Set(explorableCategories.map((c) => c.key))
            )
          }
          className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          {allOn ? "Hide all" : "Show all"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {explorableCategories.map((c) => {
          const on = active.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => toggleCat(c.key)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                on
                  ? "text-white border-transparent"
                  : "text-slate-400 border-slate-200 hover:border-slate-300"
              }`}
              style={on ? { background: c.color } : undefined}
              title={c.name}
            >
              {c.name.split(" ")[0]}
              <span className={on ? "opacity-70" : "text-slate-300"}>
                {" "}
                {catCounts.get(c.key) ?? 0}
              </span>
            </button>
          );
        })}
      </div>
      {mounted && hiddenPlaceIds.length > 0 && (
        <button
          onClick={restoreHidden}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
        >
          Restore {hiddenPlaceIds.length} hidden
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[340px] shrink-0 flex-col border-r border-black/5 bg-white">
        <div className="px-5 pt-5 pb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, dishes, neighborhoods"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
          />
          <div className="flex items-center justify-between mt-3 px-0.5">
            <span className="text-xs text-slate-400">
              {filteredPlaces.length} of {visiblePlaces.length} places
            </span>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`text-xs transition-colors ${
                filtersOpen || !allOn
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Filters{!allOn && ` · ${active.size}`} {filtersOpen ? "▴" : "▾"}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3">{filterPanelBody}</div>
          )}

          <button
            onClick={() => {
              setAddMode((v) => !v);
              setForm(BLANK_FORM);
              resetGeo();
            }}
            className={`mt-3 w-full text-sm px-3 py-2.5 rounded-xl font-medium transition-colors ${
              addMode
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {addMode ? "Cancel" : "Add a location"}
          </button>
        </div>

        {/* Add-location form */}
        {addMode && (
          <div className="px-5 pb-4 space-y-2.5 border-t border-black/5 pt-4">
            {/* Place search (geocoding) */}
            <div className="relative">
              <input
                value={geoQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setGeoQuery(v);
                  if (v.trim().length >= 3) setGeoLoading(true);
                  else {
                    setGeoResults([]);
                    setGeoLoading(false);
                  }
                }}
                placeholder="Search a place or address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
              />
              {geoQuery.trim().length >= 3 && (
                <div className="absolute z-[600] left-0 right-0 mt-1.5 bg-white border border-black/5 rounded-xl shadow-lg shadow-slate-900/10 max-h-56 overflow-y-auto overflow-hidden">
                  {geoLoading ? (
                    <div className="px-3.5 py-2.5 text-xs text-slate-400">Searching…</div>
                  ) : geoResults.length > 0 ? (
                    geoResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => pickGeoResult(r)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {r.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{r.label}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2.5 text-xs text-slate-400">No matches.</div>
                  )}
                </div>
              )}
            </div>

            {!showDetails ? (
              <p className="text-xs text-slate-400 leading-relaxed px-0.5">
                Search above, tap the map, or{" "}
                <button
                  onClick={() => setManualEntry(true)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  enter details manually
                </button>
                .
              </p>
            ) : (
              <>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Name (e.g. Joe's Coffee)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
                >
                  {explorableCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    value={form.lat}
                    onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                    placeholder="lat"
                    inputMode="decimal"
                    className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
                  />
                  <input
                    value={form.lng}
                    onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                    placeholder="lng"
                    inputMode="decimal"
                    className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
                  />
                </div>
                <button
                  onClick={submitAdd}
                  disabled={!form.name.trim() || !form.lat || !form.lng}
                  className="w-full text-sm px-3 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add location
                </button>
              </>
            )}
          </div>
        )}

        {/* Transit / route panel */}
        {route.length > 0 && (
          <div className="px-5 py-4 border-t border-black/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Transit
              </span>
              <button
                onClick={() => setRoute([])}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="text-xs text-slate-600 mt-2 space-y-1">
              <div className="flex gap-2">
                <span className="font-semibold text-blue-600 w-3">A</span>
                <span className="truncate">{route[0].label}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-blue-600 w-3">B</span>
                {route[1]?.label ? (
                  <span className="truncate">{route[1].label}</span>
                ) : (
                  <span className="text-slate-400">select a second place…</span>
                )}
              </div>
            </div>
            {suggestion &&
              (() => {
                const rec =
                  suggestion.options.find((o) => o.mode === suggestion.recommended) ??
                  suggestion.options[0];
                const others = suggestion.options.filter((o) => o.mode !== rec.mode);
                return (
                  <div className="mt-3">
                    <div className="text-xs text-slate-400 mb-2">
                      {formatDistance(suggestion.meters)} apart
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm bg-blue-600 text-white font-medium">
                        <span>
                          {rec.icon} {rec.label}
                          <span className="ml-1.5 text-[10px] font-normal opacity-80">
                            Best
                          </span>
                        </span>
                        <span>~{rec.minutes} min</span>
                      </div>
                      {showAllModes &&
                        others.map((o) => (
                          <div
                            key={o.mode}
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <span>
                              {o.icon} {o.label}
                            </span>
                            <span className="text-slate-400">~{o.minutes} min</span>
                          </div>
                        ))}
                    </div>
                    {others.length > 0 && (
                      <button
                        onClick={() => setShowAllModes((v) => !v)}
                        className="mt-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors px-1"
                      >
                        {showAllModes
                          ? "Hide other options"
                          : `Show ${others.length} other option${
                              others.length > 1 ? "s" : ""
                            }`}
                      </button>
                    )}
                  </div>
                );
              })()}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2.5 py-2 border-t border-black/5">
          <PlaceListRows
            places={filteredPlaces}
            route={route}
            onPick={selectPlaceForRoute}
            onRemove={requestRemovePlace}
          />
        </div>
      </aside>

      {/* Map */}
      <div className="flex-1 min-w-0 relative">
        <ExploreMapInner
          markers={markers}
          flyTarget={flyTarget}
          addMode={addMode}
          onMapClick={handleMapClick}
          routePoints={routeLine}
          selectedKeys={selectedKeys}
          onToggleRoute={toggleRoute}
          onRemovePlace={requestRemovePlace}
        />

        {addMode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/90 backdrop-blur text-white text-xs px-4 py-2.5 rounded-full shadow-lg">
            Tap the map to drop your new location
          </div>
        )}

        {/* Mobile category filter — single button + popover */}
        <div className="lg:hidden absolute top-3 left-3 z-[500]">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="text-xs font-medium px-3.5 py-2 rounded-full bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-900/5 border border-black/5 text-slate-700"
          >
            Filters{!allOn && ` · ${active.size}`} {filtersOpen ? "▴" : "▾"}
          </button>
          {filtersOpen && (
            <div className="mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-900/10 border border-black/5 p-3">
              {filterPanelBody}
            </div>
          )}
        </div>

        {/* Mobile bottom sheet — draggable list of all places */}
        <div
          ref={sheetRef}
          className="lg:hidden absolute inset-x-0 bottom-0 z-[600] h-[78%] flex flex-col bg-white/95 backdrop-blur-xl rounded-t-2xl border-t border-black/5 shadow-[0_-8px_30px_rgba(15,23,42,0.12)]"
          style={{
            transform: `translateY(${sheetOffset}px)`,
            transition: sheetDragging
              ? "none"
              : "transform 0.34s cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          {/* Grabber + header (drag target, also taps to toggle) */}
          <div
            className="shrink-0 pt-2.5 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={onSheetGrabStart}
            onPointerMove={onSheetGrabMove}
            onPointerUp={onSheetGrabEnd}
            onPointerCancel={onSheetGrabEnd}
          >
            <div className="mx-auto w-9 h-1.5 rounded-full bg-slate-300" />
            <div className="flex items-center justify-between px-4 pt-2">
              <span className="text-sm font-semibold text-slate-900 tracking-tight">
                {filteredPlaces.length} place{filteredPlaces.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={() => setSheetExpanded((v) => !v)}
                className="text-xs text-slate-400"
              >
                {sheetExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-2 shrink-0">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, dishes, neighborhoods"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2 pb-6 border-t border-black/5 pt-1">
            <PlaceListRows
              places={filteredPlaces}
              route={route}
              onPick={(p) => {
                selectPlaceForRoute(p);
                setSheetExpanded(false);
              }}
              onRemove={requestRemovePlace}
            />
          </div>
        </div>
      </div>

      {/* Remove confirmation */}
      {pendingRemoval && (
        <div
          className="fixed inset-0 z-[1000] grid place-items-center bg-slate-900/30 backdrop-blur-sm p-4"
          onClick={() => setPendingRemoval(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Remove location?
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Remove{" "}
              <span className="font-medium text-slate-800">{pendingRemoval.name}</span> from
              the map?
            </p>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              {customPlaces.some((p) => p.id === pendingRemoval.id)
                ? "This is a location you added — it can't be restored later."
                : 'You can bring it back later with the "Restore hidden" link.'}
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setPendingRemoval(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemovePlace}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
