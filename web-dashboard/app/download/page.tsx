"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  detectPlatform,
  DownloadPageActions,
  MacDownloadCard,
  WindowsDownloadCard,
  type Platform,
} from "@/components/marketing/DesktopDownloadButtons";

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-navy">
            SmoothPoint
          </Link>
          <Button href="/login" variant="ghost">
            로그인
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold">Desktop 다운로드</h1>
        <p className="mt-2 text-slate-600">
          SmoothPoint Desktop 앱을 설치하고 로그인하세요.
        </p>

        <DownloadPageActions platform={platform} />

        <div className="mt-8 space-y-4">
          <Card
            title="Windows"
            className={platform === "windows" ? "ring-2 ring-brand" : ""}
          >
            <WindowsDownloadCard platform={platform} />
          </Card>

          <Card
            title="macOS"
            className={platform === "mac" ? "ring-2 ring-brand" : ""}
          >
            <MacDownloadCard platform={platform} />
          </Card>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm">
          <p className="font-medium">빠른 시작</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-slate-600">
            <li>SmoothPoint-setup.exe 설치 (Windows)</li>
            <li>웹에서 가입 후 Desktop에서 로그인</li>
            <li>Shift+D로 판서 시작!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
