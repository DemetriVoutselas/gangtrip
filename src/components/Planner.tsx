"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTrip } from "@/lib/store";
import { useTemporal } from "@/lib/useTemporal";
import { useMounted } from "@/lib/useMounted";
import { downloadICS } from "@/lib/ics-export";
import DayTabs from "./DayTabs";
import Timeline from "./Timeline";
import AddEntryBar from "./AddEntryBar";
import DaySummary from "./DaySummary";
import MapColumn from "./MapColumn";

export default function Planner() {
  const mounted = useMounted();
  const trip = useTrip((s) => s.trip);
  const activeDayId = useTrip((s) => s.activeDayId);
  const optimize = useTrip((s) => s.optimizeDayOrder);
  const resetToSeed = useTrip((s) => s.resetToSeed);
  const setDayMeta = useTrip((s) => s.setDayMeta);
  const { undo, redo, canUndo, canRedo } = useTemporal();
  const [hover, setHover] = useState<string | null>(null);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const day = trip.days.find((d) => d.id === activeDayId) ?? trip.days[0];

  if (!mounted) {
    return (
      <div className="grid place-items-center h-[60vh] text-slate-400">Loading trip…</div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-lg font-bold shrink-0">
            🗽 TripBoard
          </Link>
          <span className="text-sm text-slate-400 truncate hidden sm:block">
            {trip.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ToolBtn onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
            ↶
          </ToolBtn>
          <ToolBtn onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">
            ↷
          </ToolBtn>
          <ToolBtn onClick={() => downloadICS(trip)} title="Export calendar (.ics)">
            📅 Export
          </ToolBtn>
          <ToolBtn
            onClick={() => {
              if (confirm("Reset the whole trip to the original plan? This clears your edits."))
                resetToSeed();
            }}
            title="Reset to seed"
          >
            ⟲ Reset
          </ToolBtn>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <DayTabs />
      </div>

      <main className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden">
        <section className="overflow-y-auto p-4">
          {day && (
            <>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <input
                    value={day.name}
                    onChange={(e) => setDayMeta(day.id, { name: e.target.value })}
                    className="text-base font-semibold w-full bg-transparent focus:outline-none focus:bg-slate-100 rounded px-1 -ml-1"
                  />
                  <div className="px-1">
                    <DaySummary day={day} />
                  </div>
                </div>
                <button
                  onClick={() => optimize(day.id)}
                  className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                  title="Reorder to minimize walking (respects meal order)"
                >
                  ✨ Optimize
                </button>
              </div>

              <Timeline day={day} onHover={setHover} />
              <AddEntryBar dayId={day.id} />
            </>
          )}
        </section>

        <section className="hidden lg:block p-4 pl-0">
          <MapColumn day={day} highlightEntryId={hover} />
        </section>
      </main>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
