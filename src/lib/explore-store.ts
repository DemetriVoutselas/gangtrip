"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Place } from "./types";
import { places } from "./seed";

// Custom places get ids just past the highest seed id so their numbered
// pins stay short and never collide with the built-in places.
const SEED_MAX_ID = places.reduce((m, p) => Math.max(m, p.id), 0);

export interface AddPlaceInput {
  name: string;
  category: string;
  lat: number;
  lng: number;
  famousFor?: string;
}

export interface ExploreState {
  customPlaces: Place[];
  hiddenPlaceIds: number[];
  nextCustomId: number;

  addPlace: (input: AddPlaceInput) => void;
  removePlace: (id: number) => void;
  restoreHidden: () => void;
}

export const useExplore = create<ExploreState>()(
  persist(
    immer((set) => ({
      customPlaces: [],
      hiddenPlaceIds: [],
      nextCustomId: SEED_MAX_ID + 1,

      addPlace: (input) =>
        set((s) => {
          const id = s.nextCustomId;
          s.nextCustomId += 1;
          s.customPlaces.push({
            id,
            category: input.category,
            name: input.name,
            famousFor: input.famousFor,
            branches: [
              {
                lat: input.lat,
                lng: input.lng,
                label: "Custom location",
                neighborhood: "Added by you",
              },
            ],
          });
        }),

      removePlace: (id) =>
        set((s) => {
          const isCustom = s.customPlaces.some((p) => p.id === id);
          if (isCustom) {
            s.customPlaces = s.customPlaces.filter((p) => p.id !== id);
          } else if (!s.hiddenPlaceIds.includes(id)) {
            s.hiddenPlaceIds.push(id);
          }
        }),

      restoreHidden: () =>
        set((s) => {
          s.hiddenPlaceIds = [];
        }),
    })),
    { name: "tripboard-explore-v1", version: 1 }
  )
);
