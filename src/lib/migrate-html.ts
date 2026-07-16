import Fuse from "fuse.js";
import { v4 as uuid } from "uuid";
import type { Day, Entry, MealSlot, Trip } from "./types";
import { HOME_BASE, RAW_DAYS, places } from "./seed";

/* Map a free-text label prefix to a meal slot. */
const SLOT_KEYWORDS: [MealSlot, RegExp][] = [
  ["breakfast", /breakfast|bagel|morning bagel/i],
  ["coffee", /coffee|espresso/i],
  ["lunch", /lunch|slices?/i],
  ["snack", /dessert|cookie|cinnamon|snack|sweet|cheesecake|pudding/i],
  ["dinner", /dinner/i],
  ["nightlife", /comedy|club|disco|le bain|nightlife|dance/i],
  ["latenight", /late[- ]?night|nightcap|halal|4am/i],
  ["drinks", /drinks|rooftop|bar|beer|biergarten|monkey|pub|cocktail|billiards|pool/i],
  ["activity", /museum|golf|stroll|park|market|high line|little island|piers|morning|afternoon|late am/i],
];

function inferSlot(label: string): MealSlot {
  for (const [slot, re] of SLOT_KEYWORDS) {
    if (re.test(label)) return slot;
  }
  return "activity";
}

/**
 * A label looks like "Breakfast — Apollo Bagels (Kips Bay)".
 * Strip the slot prefix and the trailing "(neighborhood)" to get a
 * clean name for fuzzy matching against the place library.
 */
function extractPlaceName(label: string): string {
  const afterDash = label.includes("—") ? label.split("—").slice(1).join("—") : label;
  return afterDash
    .replace(/\([^)]*\)/g, "") // drop parentheticals
    .replace(/\b(pastrami|square|rooftop|deli|live music|slices?)\b/gi, "")
    .trim();
}

const fuse = new Fuse(places, {
  keys: ["name"],
  threshold: 0.45,
  ignoreLocation: true,
});

function migrateStop(
  stop: [number, number, string]
): Entry {
  const [lat, lng, label] = stop;
  const slot = inferSlot(label);
  const query = extractPlaceName(label);
  const match = query ? fuse.search(query)[0] : undefined;

  if (match && match.score !== undefined && match.score < 0.5) {
    const place = match.item;
    const branchIndex = place.bestBranchIndex ?? 0;
    const branch = place.branches[branchIndex];
    return {
      id: uuid(),
      kind: "place",
      placeId: place.id,
      branchIndex,
      title: place.name,
      slot,
      lat: branch?.lat ?? lat,
      lng: branch?.lng ?? lng,
    };
  }

  // No confident match → keep as a custom entry using the label text.
  return {
    id: uuid(),
    kind: "custom",
    title: extractPlaceName(label) || label,
    slot,
    lat,
    lng,
  };
}

export function buildSeedTrip(): Trip {
  const days: Day[] = RAW_DAYS.map((rd) => ({
    id: uuid(),
    index: rd.index,
    name: rd.name,
    color: rd.color,
    date: rd.date,
    entries: rd.stops.map(migrateStop),
  }));

  return {
    id: uuid(),
    title: "NYC Food & Nightlife Trip",
    homeBase: HOME_BASE,
    days,
  };
}
