"use client";

import { useEffect, useState } from "react";
import { useTrip } from "./store";

/** Subscribe to the zundo temporal store for undo/redo state. */
export function useTemporal() {
  const temporal = useTrip.temporal;
  const [state, setState] = useState(temporal.getState());

  useEffect(() => {
    return temporal.subscribe(setState);
  }, [temporal]);

  return {
    undo: () => temporal.getState().undo(),
    redo: () => temporal.getState().redo(),
    clear: () => temporal.getState().clear(),
    canUndo: state.pastStates.length > 0,
    canRedo: state.futureStates.length > 0,
  };
}
