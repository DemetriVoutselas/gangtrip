"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Day } from "@/lib/types";
import { useTrip, entryCoords } from "@/lib/store";
import { leg } from "@/lib/geo";
import EntryCard from "./EntryCard";
import TravelConnector from "./TravelConnector";

export default function Timeline({
  day,
  onHover,
}: {
  day: Day;
  onHover?: (id: string | null) => void;
}) {
  const reorderEntry = useTrip((s) => s.reorderEntry);
  const homeBase = useTrip((s) => s.trip.homeBase);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = day.entries.findIndex((x) => x.id === active.id);
    const to = day.entries.findIndex((x) => x.id === over.id);
    if (from === -1 || to === -1) return;
    reorderEntry(day.id, from, to);
  }

  if (day.entries.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-10 text-center">
        No stops yet — add one below.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={day.entries.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {day.entries.map((entry, i) => {
            const prev = i > 0 ? day.entries[i - 1] : null;
            const a = prev ? entryCoords(prev) : homeBase;
            const b = entryCoords(entry);
            const thisLeg = !activeId && a && b ? leg(a, b) : null;
            return (
              <div key={entry.id}>
                {thisLeg && thisLeg.minutes > 2 && <TravelConnector leg={thisLeg} />}
                <EntryCard entry={entry} dayId={day.id} onHover={onHover} />
              </div>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
