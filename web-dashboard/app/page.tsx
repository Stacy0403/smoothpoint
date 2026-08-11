import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PlanPricingGrid } from "@/components/marketing/PlanPricingCard";
import { DesktopDownloadButtons } from "@/components/marketing/DesktopDownloadButtons";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-navy">
            SmoothPoint
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-navy">
              요금제
            </Link>
            <Link href="/download" className="text-sm text-slate-600 hover:text-navy">
              다운로드
            </Link>
            <Button href="/login" variant="ghost">
              로그인
            </Button>
            <Button href="/signup">무료 시작</Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            마우스만으로 타블렛급 필기
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Rust 기반 초저지연 AI 판서 보정으로, 와콤 타블렛 없이도 전문적인
            온라인 강의를 진행하세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/signup">무료 시작</Button>
            <DesktopDownloadButtons variant="hero" />
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            {[
              {
                title: "Spline 보정",
                desc: "Catmull-Rom 알고리즘으로 마우스 필기를 매끄러운 곡선으로 변환",
              },
              {
                title: "글로벌 HUD",
                desc: "강의 중 화면 전환 없이 Shift+1~5로 색상, [ ]로 두께 변경",
              },
              {
                title: "투명 오버레이",
                desc: "Zoom, PPT 등 어떤 앱 위에서도 판서 가능",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-navy">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">요금제</h2>
          <PlanPricingGrid />
          <div className="mt-8 text-center">
            <Button href="/pricing">자세히 보기</Button>
          </div>
        </section>

        <section className="bg-navy py-16 text-white">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-2xl font-bold">FAQ</h2>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="font-medium">Windows도 지원하나요?</dt>
                <dd className="mt-1 text-slate-300">
                  네. Windows 10 21H2 이상에서 SmoothPoint-setup.exe로
                  설치할 수 있습니다.
                </dd>
              </div>
              <div>
                <dt className="font-medium">Pro Trial은 어떻게 시작하나요?</dt>
                <dd className="mt-1 text-slate-300">
                  가입 후 Billing 페이지에서 14일 무료 Trial을 시작할 수 있습니다.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p>© 2026 SmoothPoint. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/legal/terms">이용약관</Link>
          <Link href="/legal/privacy">개인정보</Link>
        </div>
      </footer>
    </div>
  );
}
