export type MealSlot =
  | "breakfast"
  | "coffee"
  | "lunch"
  | "snack"
  | "activity"
  | "dinner"
  | "drinks"
  | "nightlife"
  | "latenight";

export const MEAL_SLOTS: MealSlot[] = [
  "breakfast",
  "coffee",
  "lunch",
  "snack",
  "activity",
  "dinner",
  "drinks",
  "nightlife",
  "latenight",
];

export const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  coffee: "Coffee",
  lunch: "Lunch",
  snack: "Snack / Dessert",
  activity: "Activity",
  dinner: "Dinner",
  drinks: "Drinks",
  nightlife: "Nightlife",
  latenight: "Late-night",
};

// Order used for the "optimize" soft constraint (earlier in the day = smaller).
export const SLOT_ORDER: Record<MealSlot, number> = {
  breakfast: 0,
  coffee: 1,
  lunch: 2,
  snack: 3,
  activity: 4,
  dinner: 5,
  drinks: 6,
  nightlife: 7,
  latenight: 8,
};

export interface Category {
  key: string;
  name: string;
  color: string;
}

export interface Branch {
  lat: number;
  lng: number;
  label: string;
  neighborhood: string;
}

export interface Place {
  id: number; // = PLACES[i].n
  category: string; // CAT key
  name: string;
  famousFor?: string;
  order?: string;
  price?: string;
  reservations?: string;
  line?: string;
  hours?: string;
  flag?: string;
  bestBranchIndex?: number;
  branches: Branch[];
}

export type EntryKind = "place" | "custom";

export interface Entry {
  id: string;
  kind: EntryKind;
  placeId?: number;
  branchIndex?: number;
  title: string;
  slot: MealSlot;
  startTime?: string; // "HH:mm"
  endTime?: string;
  note?: string;
  lat?: number;
  lng?: number;
  done?: boolean;
}

export interface Day {
  id: string;
  index: number;
  name: string;
  color: string;
  date?: string; // ISO date
  entries: Entry[];
}

export interface Trip {
  id: string;
  title: string;
  homeBase: { lat: number; lng: number; label: string };
  days: Day[];
  shareId?: string;
}
