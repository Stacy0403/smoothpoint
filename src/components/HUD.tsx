import { COLOR_NAMES } from "../types";

export function HUD({
  visible,
  x,
  y,
  color,
  width,
}: {
  visible: boolean;
  x: number;
  y: number;
  color: string;
  width: number;
}) {
  const colorName = COLOR_NAMES[color.toUpperCase()] ?? color;

  return (
    <div
      className={`hud ${visible ? "visible" : ""}`}
      style={{ left: x + 12, top: y + 12 }}
    >
      <span className="hud-dot" style={{ backgroundColor: color }} />
      <span>{colorName}</span>
      <span>|</span>
      <span>두께: {width}</span>
    </div>
  );
}
