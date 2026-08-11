"use client";

import { useState } from "react";

export function LogoUpload({
  organizationId,
  currentUrl,
  onUploaded,
}: {
  organizationId: string;
  currentUrl?: string | null;
  onUploaded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("organization_id", organizationId);

    const res = await fetch("/api/v1/org/logo", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    setLoading(false);
    onUploaded();
  }

  return (
    <div className="space-y-3">
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt="Organization logo"
          className="h-12 w-auto rounded border"
        />
      )}
      <label className="inline-block cursor-pointer">
        <input
          type="file"
          accept="image/png,image/svg+xml,image/jpeg"
          className="hidden"
          onChange={handleUpload}
          disabled={loading}
        />
        <span className="inline-flex items-center justify-center rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light">
          {loading ? "업로드 중..." : "로고 업로드"}
        </span>
      </label>
      <p className="text-xs text-slate-500">PNG, SVG · 최대 2MB</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
