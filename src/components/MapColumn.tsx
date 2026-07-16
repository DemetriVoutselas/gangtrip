"use client";

import dynamic from "next/dynamic";
import type { Day } from "@/lib/types";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center bg-slate-200 text-slate-500 text-sm">
      Loading map…
    </div>
  ),
});

export default function MapColumn({
  day,
  highlightEntryId,
}: {
  day: Day | undefined;
  highlightEntryId?: string | null;
}) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-black/5 shadow-sm shadow-slate-900/[0.04]">
      <MapInner day={day} highlightEntryId={highlightEntryId} />
    </div>
  );
}
