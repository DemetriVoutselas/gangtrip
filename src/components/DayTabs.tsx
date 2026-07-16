"use client";

import { useTrip } from "@/lib/store";

export default function DayTabs() {
  const days = useTrip((s) => s.trip.days);
  const activeDayId = useTrip((s) => s.activeDayId);
  const setActiveDay = useTrip((s) => s.setActiveDay);

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {days.map((d) => {
        const active = d.id === activeDayId;
        const label = d.name.split("—")[1]?.trim() ?? d.name;
        return (
          <button
            key={d.id}
            onClick={() => setActiveDay(d.id)}
            className={`shrink-0 px-3 py-2 rounded-lg text-left border transition ${
              active
                ? "text-white border-transparent"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
            style={active ? { background: d.color } : undefined}
          >
            <div className="text-xs opacity-80">Day {d.index}</div>
            <div className="text-sm font-medium whitespace-nowrap">{label}</div>
          </button>
        );
      })}
    </div>
  );
}
