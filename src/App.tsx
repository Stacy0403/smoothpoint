import { useCallback, useEffect, useRef, useState } from "react";
import { OverlayCanvas, type OverlayCanvasHandle } from "./components/OverlayCanvas";
import { HUD } from "./components/HUD";
import { Watermark } from "./components/Watermark";
import { SettingsWindow } from "./components/settings/SettingsWindow";
import { useLicense } from "./hooks/useLicense";
import { useGlobalShortcutHandlers } from "./hooks/useGlobalShortcut";
import { tauriInvoke, isTauri } from "./hooks/useTauriInvoke";
import {
  DEFAULT_SETTINGS,
  type LocalSettings,
  type PenState,
} from "./types";

type AppMode = "overlay" | "settings";

function App() {
  const [mode, setMode] = useState<AppMode>("overlay");
  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
  const [pen, setPen] = useState<PenState>({
    color: DEFAULT_SETTINGS.pen_color,
    width: DEFAULT_SETTINGS.pen_width,
  });
  const [drawing, setDrawing] = useState(false);
  const [clickThrough, setClickThrough] = useState(true);
  const [hudVisible, setHudVisible] = useState(false);
  const [hudPos, setHudPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<OverlayCanvasHandle>(null);

  const { license } = useLicense();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("window") === "settings") {
      setMode("settings");
    }
  }, []);

  const showHud = useCallback((color: string, width: number) => {
    setPen({ color, width });
    setHudVisible(true);
    setTimeout(() => setHudVisible(false), 500);
  }, []);

  const toggleDrawing = useCallback(async () => {
    const next = !drawing;
    setDrawing(next);
    setClickThrough(!next);

    if (isTauri()) {
      await tauriInvoke("set_drawing_mode", { enabled: next });
      await tauriInvoke("set_click_through", { enabled: !next });
    }
  }, [drawing]);

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
  }, []);

  useGlobalShortcutHandlers(
    (color, width) => showHud(color, width),
    toggleDrawing,
    handleUndo
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setHudPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (!isTauri()) return;
    tauriInvoke("register_hotkeys", {
      colorPresets: settings.color_presets,
    }).catch(console.error);
  }, [settings.color_presets]);

  if (mode === "settings") {
    return (
      <SettingsWindow settings={settings} onSettingsChange={setSettings} />
    );
  }

  const calligraphy =
    settings.calligraphy_mode &&
    (license?.plan_type === "pro" || license?.plan_type === "enterprise");

  const smoothing =
    license?.plan_type === "free" ? 50 : settings.smoothing_strength;

  return (
    <div className="overlay-root">
      {!clickThrough && (
        <div className="status-bar">판서 모드 · Shift+D로 종료</div>
      )}

      <OverlayCanvas
        ref={canvasRef}
        pen={pen}
        smoothing={smoothing}
        calligraphy={!!calligraphy}
        clickThrough={clickThrough}
      />

      <HUD
        visible={hudVisible}
        x={hudPos.x}
        y={hudPos.y}
        color={pen.color}
        width={pen.width}
      />

      <Watermark license={license} />

      {!isTauri() && (
        <div
          style={{
            position: "fixed",
            bottom: 60,
            left: 16,
            zIndex: 10001,
            display: "flex",
            gap: 8,
          }}
        >
          <button type="button" className="btn" onClick={toggleDrawing}>
            {drawing ? "판서 종료" : "판서 시작"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMode("settings")}
          >
            설정
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
