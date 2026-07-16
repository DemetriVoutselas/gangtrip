"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import { immer } from "zustand/middleware/immer";
import { v4 as uuid } from "uuid";
import type { Day, Entry, Trip } from "./types";
import { SLOT_ORDER } from "./types";
import { buildSeedTrip } from "./migrate-html";
import { PLACE_BY_ID } from "./seed";
import { haversineMeters } from "./geo";

const PERSIST_VERSION = 1;

export interface TripState {
  trip: Trip;
  activeDayId: string;
  hydrated: boolean;

  setActiveDay: (dayId: string) => void;
  setHydrated: () => void;

  addEntry: (dayId: string, entry: Omit<Entry, "id">) => void;
  updateEntry: (dayId: string, entryId: string, patch: Partial<Entry>) => void;
  removeEntry: (dayId: string, entryId: string) => void;
  toggleDone: (dayId: string, entryId: string) => void;

  reorderEntry: (dayId: string, fromIndex: number, toIndex: number) => void;
  moveEntryAcrossDays: (
    fromDayId: string,
    toDayId: string,
    entryId: string,
    toIndex: number
  ) => void;

  setDayMeta: (dayId: string, patch: Partial<Pick<Day, "name" | "date">>) => void;
  optimizeDayOrder: (dayId: string) => void;
  setTripTitle: (title: string) => void;
  resetToSeed: () => void;
}

function findDay(trip: Trip, dayId: string): Day | undefined {
  return trip.days.find((d) => d.id === dayId);
}

/** Greedy nearest-neighbour ordering, respecting slot order as a soft key. */
function optimize(entries: Entry[], start: { lat: number; lng: number }): Entry[] {
  const withCoords = entries.filter((e) => e.lat != null && e.lng != null);
  const withoutCoords = entries.filter((e) => e.lat == null || e.lng == null);

  // Group by slot bucket so we never put dinner before breakfast.
  const buckets = new Map<number, Entry[]>();
  for (const e of withCoords) {
    const k = SLOT_ORDER[e.slot];
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(e);
  }

  const result: Entry[] = [];
  let cursor = start;
  for (const key of [...buckets.keys()].sort((a, b) => a - b)) {
    const pool = buckets.get(key)!;
    // nearest-neighbour within the bucket
    while (pool.length) {
      let bestIdx = 0;
      let bestDist = Infinity;
      pool.forEach((e, i) => {
        const d = haversineMeters(cursor, { lat: e.lat!, lng: e.lng! });
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      const [chosen] = pool.splice(bestIdx, 1);
      result.push(chosen);
      cursor = { lat: chosen.lat!, lng: chosen.lng! };
    }
  }
  return [...result, ...withoutCoords];
}

export const useTrip = create<TripState>()(
  temporal(
    persist(
      immer((set) => ({
        trip: buildSeedTrip(),
        activeDayId: "",
        hydrated: false,

        setActiveDay: (dayId) =>
          set((s) => {
            s.activeDayId = dayId;
          }),

        setHydrated: () =>
          set((s) => {
            s.hydrated = true;
            if (!s.activeDayId || !findDay(s.trip, s.activeDayId)) {
              s.activeDayId = s.trip.days[0]?.id ?? "";
            }
          }),

        addEntry: (dayId, entry) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            if (day) day.entries.push({ ...entry, id: uuid() });
          }),

        updateEntry: (dayId, entryId, patch) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            const e = day?.entries.find((x) => x.id === entryId);
            if (e) Object.assign(e, patch);
          }),

        removeEntry: (dayId, entryId) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            if (day) day.entries = day.entries.filter((x) => x.id !== entryId);
          }),

        toggleDone: (dayId, entryId) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            const e = day?.entries.find((x) => x.id === entryId);
            if (e) e.done = !e.done;
          }),

        reorderEntry: (dayId, fromIndex, toIndex) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            if (!day) return;
            if (
              fromIndex < 0 ||
              toIndex < 0 ||
              fromIndex >= day.entries.length ||
              toIndex >= day.entries.length
            )
              return;
            const [moved] = day.entries.splice(fromIndex, 1);
            day.entries.splice(toIndex, 0, moved);
          }),

        moveEntryAcrossDays: (fromDayId, toDayId, entryId, toIndex) =>
          set((s) => {
            const from = findDay(s.trip, fromDayId);
            const to = findDay(s.trip, toDayId);
            if (!from || !to) return;
            const idx = from.entries.findIndex((x) => x.id === entryId);
            if (idx === -1) return;
            const [moved] = from.entries.splice(idx, 1);
            const clamped = Math.max(0, Math.min(toIndex, to.entries.length));
            to.entries.splice(clamped, 0, moved);
          }),

        setDayMeta: (dayId, patch) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            if (day) Object.assign(day, patch);
          }),

        optimizeDayOrder: (dayId) =>
          set((s) => {
            const day = findDay(s.trip, dayId);
            if (day) day.entries = optimize(day.entries, s.trip.homeBase);
          }),

        setTripTitle: (title) =>
          set((s) => {
            s.trip.title = title;
          }),

        resetToSeed: () =>
          set((s) => {
            s.trip = buildSeedTrip();
            s.activeDayId = s.trip.days[0]?.id ?? "";
          }),
      })),
      {
        name: "tripboard-v1",
        version: PERSIST_VERSION,
        partialize: (s) => ({ trip: s.trip, activeDayId: s.activeDayId }),
        onRehydrateStorage: () => (state) => {
          // Best-effort: initializes activeDayId once storage is read.
          // UI loading state should NOT depend on this firing — see
          // useMounted() for the hydration-safety gate used by pages.
          try {
            state?.setHydrated();
          } catch (err) {
            console.error("tripboard: rehydrate callback failed", err);
          }
        },
      }
    ),
    {
      // Only track trip edits for undo/redo, not selection/hydration.
      partialize: (s) => ({ trip: s.trip }),
      limit: 100,
    }
  )
);

/** Resolve an entry's live coordinates (branch coords win over stored). */
export function entryCoords(entry: Entry): { lat: number; lng: number } | null {
  if (entry.placeId !== undefined) {
    const place = PLACE_BY_ID[entry.placeId];
    const branch = place?.branches[entry.branchIndex ?? 0];
    if (branch) return { lat: branch.lat, lng: branch.lng };
  }
  if (entry.lat != null && entry.lng != null) return { lat: entry.lat, lng: entry.lng };
  return null;
}
