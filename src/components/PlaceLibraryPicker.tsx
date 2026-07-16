"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { MealSlot, Place } from "@/lib/types";
import { CATEGORY_BY_KEY, places } from "@/lib/seed";

interface Props {
  onPick: (place: Place, branchIndex: number) => void;
  onClose: () => void;
}

const fuse = new Fuse(places, {
  keys: ["name", "famousFor", "branches.neighborhood"],
  threshold: 0.4,
  ignoreLocation: true,
});

export default function PlaceLibraryPicker({ onPick, onClose }: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Place | null>(null);
  const [branchIdx, setBranchIdx] = useState(0);
  const [cat, setCat] = useState<string>("all");

  const results = useMemo(() => {
    let list = q.trim() ? fuse.search(q).map((r) => r.item) : places;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    return list.filter((p) => p.category !== "home");
  }, [q, cat]);

  const cats = useMemo(
    () => Array.from(new Set(places.map((p) => p.category))).filter((c) => c !== "home"),
    []
  );

  function choose(p: Place) {
    setSelected(p);
    setBranchIdx(p.bestBranchIndex ?? 0);
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/30 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-black/5 flex items-center gap-2">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search places (name, dish, neighborhood)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] transition"
          />
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3 border-b border-black/5 flex gap-1.5 flex-wrap">
          <Chip active={cat === "all"} onClick={() => setCat("all")} label="All" />
          {cats.map((c) => (
            <Chip
              key={c}
              active={cat === c}
              onClick={() => setCat(c)}
              label={CATEGORY_BY_KEY[c]?.name ?? c}
              color={CATEGORY_BY_KEY[c]?.color}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {results.map((p) => {
            const isSel = selected?.id === p.id;
            const color = CATEGORY_BY_KEY[p.category]?.color ?? "#334155";
            return (
              <div key={p.id} className="border-b border-black/[0.04]">
                <button
                  onClick={() => choose(p)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                    isSel ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="font-medium">{p.name}</span>
                    {p.branches.length > 1 && (
                      <span className="text-xs text-slate-400">
                        · {p.branches.length} branches
                      </span>
                    )}
                  </div>
                  {p.famousFor && (
                    <div className="text-sm text-slate-500 mt-0.5">{p.famousFor}</div>
                  )}
                </button>

                {isSel && (
                  <div className="px-4 pb-3 space-y-2">
                    {p.branches.length > 1 && (
                      <div className="flex flex-col gap-1">
                        {p.branches.map((b, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`branch-${p.id}`}
                              checked={branchIdx === i}
                              onChange={() => setBranchIdx(i)}
                            />
                            <span>{b.label}</span>
                            <span className="text-slate-400">· {b.neighborhood}</span>
                            {p.bestBranchIndex === i && (
                              <span className="text-amber-600 text-xs font-semibold">
                                ★ best
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                    {p.order && (
                      <p className="text-xs text-slate-500">
                        <strong>Order:</strong> {p.order}
                      </p>
                    )}
                    <button
                      onClick={() => onPick(p, branchIdx)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add to day
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {results.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No matches.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {color && !active && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
          style={{ background: color }}
        />
      )}
      {label}
    </button>
  );
}

// Slot is chosen after picking; default inference lives in the parent.
export type { MealSlot };
