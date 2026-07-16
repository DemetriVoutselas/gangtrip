"use client";

import type { Leg } from "@/lib/geo";
import { formatDistance } from "@/lib/geo";

export default function TravelConnector({ leg }: { leg: Leg }) {
  return (
    <div className="flex items-center gap-2 pl-8 py-1 text-xs text-slate-400">
      <span className="border-l-2 border-dotted border-slate-300 h-4" />
      <span>
        {leg.suggestSubway ? "🚇" : "🚶"} {formatDistance(leg.meters)} · ~{leg.minutes} min
        {leg.suggestSubway ? " walk (consider subway)" : " walk"}
      </span>
    </div>
  );
}
