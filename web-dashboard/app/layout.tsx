import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmoothPoint — 마우스만으로 타블렛급 필기",
  description: "Rust 기반 초저지연 AI 판서 보정 SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
