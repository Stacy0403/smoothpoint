import type { LicenseCache } from "../types";

export function Watermark({ license }: { license: LicenseCache | null }) {
  if (!license) return null;

  const { watermark, plan_type } = license;

  if (plan_type === "pro" && watermark.type === "none") {
    return null;
  }

  if (watermark.type === "organization" && watermark.url) {
    return (
      <div
        className="watermark"
        style={{ opacity: watermark.opacity ?? 0.7 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={watermark.url} alt="Organization" />
      </div>
    );
  }

  if (plan_type === "free" || watermark.type === "branded") {
    return (
      <div className="watermark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#64748b">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        <span>SmoothPoint</span>
      </div>
    );
  }

  return null;
}
