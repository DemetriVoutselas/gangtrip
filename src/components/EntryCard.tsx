"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Entry, MealSlot } from "@/lib/types";
import { MEAL_SLOTS, SLOT_LABEL } from "@/lib/types";
import { useTrip } from "@/lib/store";
import { CATEGORY_BY_KEY, PLACE_BY_ID } from "@/lib/seed";
import { checkHours } from "@/lib/hours";

export default function EntryCard({
  entry,
  dayId,
  onHover,
}: {
  entry: Entry;
  dayId: string;
  onHover?: (id: string | null) => void;
}) {
  const updateEntry = useTrip((s) => s.updateEntry);
  const removeEntry = useTrip((s) => s.removeEntry);
  const toggleDone = useTrip((s) => s.toggleDone);
  const moveAcross = useTrip((s) => s.moveEntryAcrossDays);
  const days = useTrip((s) => s.trip.days);
  const [open, setOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const place = entry.placeId !== undefined ? PLACE_BY_ID[entry.placeId] : undefined;
  const branch =
    place && entry.branchIndex !== undefined ? place.branches[entry.branchIndex] : undefined;
  const color = place ? CATEGORY_BY_KEY[place.category]?.color ?? "#334155" : "#64748b";
  const warning = checkHours(place, entry.startTime);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-slate-200 shadow-sm"
      onMouseEnter={() => onHover?.(entry.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <input
          type="checkbox"
          checked={!!entry.done}
          onChange={() => toggleDone(dayId, entry.id)}
          className="mt-1"
          aria-label="Mark done"
        />

        <span
          className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: color }}
          title={place ? CATEGORY_BY_KEY[place.category]?.name : "Custom"}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {SLOT_LABEL[entry.slot]}
            </span>
            {entry.startTime && (
              <span className="text-xs text-slate-500">
                {entry.startTime}
                {entry.endTime ? `–${entry.endTime}` : ""}
              </span>
            )}
          </div>
          <div
            className={`font-medium leading-tight ${
              entry.done ? "line-through text-slate-400" : ""
            }`}
          >
            {entry.title}
          </div>
          {branch && (
            <div className="text-sm text-slate-500">
              {branch.label} · {branch.neighborhood}
            </div>
          )}
          {entry.note && <div className="text-sm text-slate-600 mt-1">{entry.note}</div>}
          {warning && (
            <div
              className={`text-xs mt-1 rounded px-2 py-1 ${
                warning.level === "warn"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-sky-50 text-sky-700"
              }`}
            >
              {warning.level === "warn" ? "⚠ " : "ℹ "}
              {warning.message}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            {open ? "Done" : "Edit"}
          </button>
          <button
            onClick={() => removeEntry(dayId, entry.id)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 p-3 space-y-3">
          <label className="block">
            <span className="text-xs text-slate-500">Title</span>
            <input
              value={entry.title}
              onChange={(e) => updateEntry(dayId, entry.id, { title: e.target.value })}
              className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-slate-300 text-sm"
            />
          </label>

          <div>
            <span className="text-xs text-slate-500">Slot</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {MEAL_SLOTS.map((s) => (
                <button
                  key={s}
                  onClick={() => updateEntry(dayId, entry.id, { slot: s })}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    entry.slot === s
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {SLOT_LABEL[s as MealSlot]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex-1">
              <span className="text-xs text-slate-500">Start</span>
              <input
                type="time"
                value={entry.startTime ?? ""}
                onChange={(e) =>
                  updateEntry(dayId, entry.id, { startTime: e.target.value || undefined })
                }
                className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-slate-300 text-sm"
              />
            </label>
            <label className="flex-1">
              <span className="text-xs text-slate-500">End</span>
              <input
                type="time"
                value={entry.endTime ?? ""}
                onChange={(e) =>
                  updateEntry(dayId, entry.id, { endTime: e.target.value || undefined })
                }
                className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-slate-300 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-slate-500">Note</span>
            <textarea
              value={entry.note ?? ""}
              onChange={(e) =>
                updateEntry(dayId, entry.id, { note: e.target.value || undefined })
              }
              rows={2}
              className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-slate-300 text-sm"
            />
          </label>

          {place && place.branches.length > 1 && (
            <label className="block">
              <span className="text-xs text-slate-500">Branch</span>
              <select
                value={entry.branchIndex ?? 0}
                onChange={(e) =>
                  updateEntry(dayId, entry.id, { branchIndex: Number(e.target.value) })
                }
                className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-slate-300 text-sm"
              >
                {place.branches.map((b, i) => (
                  <option key={i} value={i}>
                    {b.label} — {b.neighborhood}
                    {place.bestBranchIndex === i ? " ★" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          {place?.reservations && (
            <p className="text-xs text-slate-500">
              <strong>Reservations:</strong> {place.reservations}
            </p>
          )}
          {place?.price && (
            <p className="text-xs text-slate-500">
              <strong>Price:</strong> {place.price}
            </p>
          )}

          {days.length > 1 && (
            <label className="block">
              <span className="text-xs text-slate-500">Move to another day</span>
              <select
                value=""
                onChange={(e) => {
                  const target = e.target.value;
                  if (target && target !== dayId) {
                    const to = days.find((d) => d.id === target);
                    moveAcross(dayId, target, entry.id, to?.entries.length ?? 0);
                  }
                }}
                className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-slate-300 text-sm"
              >
                <option value="">Keep on this day…</option>
                {days
                  .filter((d) => d.id !== dayId)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      Day {d.index}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
