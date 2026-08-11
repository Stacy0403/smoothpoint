/**
 * GitHub Releases download URLs for SmoothPoint Desktop.
 *
 * Set NEXT_PUBLIC_GITHUB_REPO=owner/repo in web-dashboard/.env.local
 * After pushing tag v1.0.0, CI uploads:
 *   - SmoothPoint-setup.exe
 *   - SmoothPoint.dmg
 */

const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "";

function releaseAsset(filename: string): string | null {
  if (!GITHUB_REPO || GITHUB_REPO.includes("your-")) return null;
  return `https://github.com/${GITHUB_REPO}/releases/latest/download/${filename}`;
}

export const DOWNLOAD_ASSETS = {
  windows: "SmoothPoint-setup.exe",
  macos: "SmoothPoint.dmg",
} as const;

export function getWindowsDownloadUrl(): string | null {
  return releaseAsset(DOWNLOAD_ASSETS.windows);
}

export function getMacDownloadUrl(): string | null {
  return releaseAsset(DOWNLOAD_ASSETS.macos);
}

export function getGitHubReleasesUrl(): string | null {
  if (!GITHUB_REPO || GITHUB_REPO.includes("your-")) return null;
  return `https://github.com/${GITHUB_REPO}/releases/latest`;
}

/** Pick primary download for user's OS (client-side) */
export function getDownloadUrlForPlatform(
  platform: "mac" | "windows" | "other"
): { url: string; label: string } | null {
  if (platform === "windows") {
    const url = getWindowsDownloadUrl();
    if (url) return { url, label: "SmoothPoint-setup.exe 다운로드" };
  }
  if (platform === "mac") {
    const url = getMacDownloadUrl();
    if (url) return { url, label: "SmoothPoint.dmg 다운로드" };
  }
  const win = getWindowsDownloadUrl();
  if (win) return { url: win, label: "Windows (.exe)" };
  const mac = getMacDownloadUrl();
  if (mac) return { url: mac, label: "macOS (.dmg)" };
  return null;
}
