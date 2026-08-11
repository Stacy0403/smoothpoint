export interface Point {
  x: number;
  y: number;
  t: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  path: string;
  color: string;
  width: number;
}

export interface PenState {
  color: string;
  width: number;
}

export interface LicenseCache {
  user_id: string;
  plan_type: "free" | "pro" | "enterprise";
  features: string[];
  watermark: {
    type: string;
    url: string | null;
    position?: string;
    opacity?: number;
    width?: number;
    height?: number;
  };
  organization: { id: string; name: string } | null;
  cached_at: string;
}

export interface LocalSettings {
  pen_color: string;
  pen_width: number;
  color_presets: string[];
  smoothing_strength: number;
  auto_click_through: boolean;
  minimize_to_tray: boolean;
  calligraphy_mode: boolean;
}

export const DEFAULT_SETTINGS: LocalSettings = {
  pen_color: "#FF0000",
  pen_width: 4,
  color_presets: ["#FF0000", "#0000FF", "#00AA00", "#FF8800", "#000000"],
  smoothing_strength: 50,
  auto_click_through: true,
  minimize_to_tray: true,
  calligraphy_mode: false,
};

export const COLOR_NAMES: Record<string, string> = {
  "#FF0000": "빨강",
  "#0000FF": "파랑",
  "#00AA00": "초록",
  "#FF8800": "주황",
  "#000000": "검정",
};
