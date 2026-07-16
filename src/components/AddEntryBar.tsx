"use client";

import { useState } from "react";
import type { MealSlot, Place } from "@/lib/types";
import { MEAL_SLOTS, SLOT_LABEL } from "@/lib/types";
import { useTrip } from "@/lib/store";
import PlaceLibraryPicker from "./PlaceLibraryPicker";

const SLOT_FOR_CATEGORY: Record<string, MealSlot> = {
  del: "breakfast",
  cof: "coffee",
  pza: "lunch",
  bak: "snack",
  sav: "lunch",
  stk: "dinner",
  bar: "drinks",
  nit: "nightlife",
  act: "activity",
};

export default function AddEntryBar({ dayId }: { dayId: string }) {
  const addEntry = useTrip((s) => s.addEntry);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState<MealSlot>("activity");

  function handlePick(place: Place, branchIndex: number) {
    const branch = place.branches[branchIndex];
    addEntry(dayId, {
      kind: "place",
      placeId: place.id,
      branchIndex,
      title: place.name,
      slot: SLOT_FOR_CATEGORY[place.category] ?? "activity",
      lat: branch?.lat,
      lng: branch?.lng,
    });
    setPickerOpen(false);
  }

  function addCustom() {
    if (!title.trim()) return;
    addEntry(dayId, { kind: "custom", title: title.trim(), slot });
    setTitle("");
    setSlot("activity");
    setCustomOpen(false);
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex-1 px-3 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add from library
        </button>
        <button
          onClick={() => setCustomOpen((v) => !v)}
          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Add custom
        </button>
      </div>

      {customOpen && (
        <div className="mt-2.5 p-4 bg-white rounded-2xl border border-black/5 shadow-sm shadow-slate-900/[0.03] space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="e.g. Walk the Brooklyn Bridge"
            className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
          />
          <div className="flex flex-wrap gap-1">
            {MEAL_SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  slot === s
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                {SLOT_LABEL[s]}
              </button>
            ))}
          </div>
          <button
            onClick={addCustom}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {pickerOpen && (
        <PlaceLibraryPicker onPick={handlePick} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
}
