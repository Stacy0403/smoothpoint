import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { isTauri } from "./useTauriInvoke";

interface PenChangedPayload {
  color: string;
  width: number;
}

export function useGlobalShortcutHandlers(
  onPenChanged: (color: string, width: number) => void,
  onToggleDrawing: () => void,
  onUndo: () => void
) {
  useEffect(() => {
    if (!isTauri()) return;

    const unsubs: Array<Promise<() => void>> = [];

    unsubs.push(
      listen<PenChangedPayload>("pen_changed", (e) => {
        onPenChanged(e.payload.color, e.payload.width);
      })
    );

    unsubs.push(listen("toggle_drawing", () => onToggleDrawing()));
    unsubs.push(listen("undo_stroke", () => onUndo()));

    return () => {
      unsubs.forEach((p) => p.then((fn) => fn()));
    };
  }, [onPenChanged, onToggleDrawing, onUndo]);
}
