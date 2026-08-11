"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getDownloadUrlForPlatform,
  getMacDownloadUrl,
  getWindowsDownloadUrl,
  getGitHubReleasesUrl,
} from "@/lib/releases";

type Platform = "mac" | "windows" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "other";
}

export function DesktopDownloadButtons({
  variant = "page",
}: {
  variant?: "hero" | "page";
}) {
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const primary = getDownloadUrlForPlatform(platform);

  if (variant === "hero") {
    if (primary) {
      return (
        <Button href={primary.url} variant="secondary">
          {platform === "windows"
            ? "Windows 다운로드 (.exe)"
            : platform === "mac"
              ? "macOS 다운로드 (.dmg)"
              : "Desktop 다운로드"}
        </Button>
      );
    }
    return (
      <Button href="/download" variant="secondary">
        Desktop 다운로드
      </Button>
    );
  }

  return null;
}

export function DownloadPageActions({ platform }: { platform: Platform }) {
  const windowsUrl = getWindowsDownloadUrl();
  const macUrl = getMacDownloadUrl();
  const releasesUrl = getGitHubReleasesUrl();

  return (
    <>
      {!windowsUrl && platform === "windows" && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          GitHub Release가 아직 없습니다. 저장소에 코드를 push한 뒤{" "}
          <code className="rounded bg-amber-100 px-1">v1.0.0</code> 태그를
          push하면 CI가 <strong>SmoothPoint-setup.exe</strong>를 자동
          빌드합니다.
        </div>
      )}

      {windowsUrl && platform === "windows" && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Windows용 설치 파일이 준비되어 있습니다. 아래 버튼으로 바로
          다운로드하세요.
        </div>
      )}
    </>
  );
}

export function WindowsDownloadCard({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  const windowsUrl = getWindowsDownloadUrl();
  const releasesUrl = getGitHubReleasesUrl();

  return (
    <div className={className}>
      <p className="mb-4 text-sm text-slate-600">
        Windows 10 21H2 이상 · 64bit
      </p>
      {windowsUrl ? (
        <>
          <Button href={windowsUrl} variant="primary" className="w-full sm:w-auto">
            SmoothPoint-setup.exe 다운로드
          </Button>
          {releasesUrl && (
            <p className="mt-2 text-xs text-slate-400">
              <a
                href={releasesUrl}
                className="text-brand hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Releases
              </a>
              에서 이전 버전 확인
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600">
            첫 릴리스 빌드 후 <strong>SmoothPoint-setup.exe</strong>가
            자동 배포됩니다.
          </p>
          <Button href="/contact" variant="secondary">
            릴리스 알림 문의
          </Button>
        </>
      )}
    </div>
  );
}

export function MacDownloadCard({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  const macUrl = getMacDownloadUrl();
  const releasesUrl = getGitHubReleasesUrl();

  return (
    <div className={className}>
      <p className="mb-4 text-sm text-slate-600">
        macOS 13 (Ventura) 이상 · Apple Silicon / Intel
      </p>
      {macUrl ? (
        <>
          <Button href={macUrl} variant="primary" className="w-full sm:w-auto">
            SmoothPoint.dmg 다운로드
          </Button>
          {releasesUrl && (
            <p className="mt-2 text-xs text-slate-400">
              <a
                href={releasesUrl}
                className="text-brand hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Releases
              </a>
              에서 이전 버전 확인
            </p>
          )}
        </>
      ) : (
        <>
          <Button variant="primary" disabled>
            SmoothPoint.dmg (빌드 대기)
          </Button>
          <p className="mt-2 text-xs text-slate-400">
            GitHub Actions 릴리스 후 제공됩니다.
          </p>
        </>
      )}
    </div>
  );
}

export { detectPlatform };
export type { Platform };
