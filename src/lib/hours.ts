import type { Place } from "./types";

/** Parse "HH:mm" → minutes since midnight, or null. */
function parseHHMM(t?: string): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Rough detection: a venue whose earliest opening is in the evening. */
function eveningOnly(hours?: string): boolean {
  if (!hours) return false;
  // Look for a leading open time like "6pm", "7:30pm" that is PM,
  // and no morning "am" open time.
  const hasMorning = /\b(\d{1,2})(:\d{2})?\s?am\b/i.test(hours);
  const firstPm = /\b(\d{1,2})(:\d{2})?\s?pm\b/i.exec(hours);
  if (hasMorning) return false;
  if (firstPm) {
    const hr = parseInt(firstPm[1], 10);
    return hr >= 4 && hr <= 11; // opens 4pm–11pm
  }
  return false;
}

export interface HoursWarning {
  level: "warn" | "info";
  message: string;
}

/**
 * Best-effort closure check. Returns a warning when the entry's start time
 * looks incompatible with the place's posted hours, or when the place has a
 * seed flag (relocation / closure caveat).
 */
export function checkHours(
  place: Place | undefined,
  startTime?: string
): HoursWarning | null {
  if (!place) return null;

  if (place.flag) {
    return { level: "info", message: place.flag };
  }

  const start = parseHHMM(startTime);
  if (start === null) return null;

  if (eveningOnly(place.hours) && start < 15 * 60) {
    return {
      level: "warn",
      message: `Likely closed at this time — ${place.name} opens in the evening (${place.hours ?? "see hours"}).`,
    };
  }

  // Very early morning (before 6:30am) is suspect for almost everything.
  if (start < 6 * 60 + 30) {
    return {
      level: "warn",
      message: `Very early — confirm ${place.name} is open before 6:30am.`,
    };
  }

  return null;
}
