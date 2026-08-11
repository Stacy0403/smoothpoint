"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  ENTERPRISE_CONTACT_EMAIL,
  ENTERPRISE_MAILTO,
} from "@/lib/contact";

function ContactForm() {
  const searchParams = useSearchParams();
  const isEnterprise = searchParams.get("plan") === "enterprise";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [seats, setSeats] = useState("");
  const [message, setMessage] = useState(
    isEnterprise
      ? "Enterprise 플랜 도입을 검토 중입니다.\n\n"
      : ""
  );
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const subject = isEnterprise
      ? "SmoothPoint Enterprise 문의"
      : "SmoothPoint 문의";
    const body = [
      `이름: ${name}`,
      `이메일: ${email}`,
      company ? `회사/학원: ${company}` : null,
      seats ? `예상 좌석 수: ${seats}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-navy">
            SmoothPoint
          </Link>
          <Button href="/pricing" variant="ghost">
            요금제
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-3xl font-bold text-navy">
          {isEnterprise ? "Enterprise 문의" : "문의하기"}
        </h1>
        <p className="mt-2 text-slate-600">
          {isEnterprise
            ? "학원·기업 B2B 도입, 좌석 견적, 데모 요청을 남겨주세요."
            : "궁금한 점을 남겨주시면 빠르게 답변드리겠습니다."}
        </p>

        {submitted ? (
          <Card className="mt-8">
            <p className="text-sm text-slate-700">
              메일 앱이 열리지 않았다면 아래 주소로 직접 문의해 주세요.
            </p>
            <a
              href={ENTERPRISE_MAILTO}
              className="mt-3 inline-block text-brand hover:underline"
            >
              {ENTERPRISE_CONTACT_EMAIL}
            </a>
            <div className="mt-6">
              <Button href="/" variant="ghost">
                홈으로
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="이름"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="이메일"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="회사 / 학원명"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="OO학원"
              />
              {isEnterprise && (
                <Input
                  label="예상 좌석 수"
                  id="seats"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  placeholder="예: 10"
                />
              )}
              <div className="space-y-1">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700"
                >
                  문의 내용
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <Button type="submit" className="w-full">
                이메일로 문의 보내기
              </Button>
              <p className="text-center text-xs text-slate-500">
                또는{" "}
                <a
                  href={ENTERPRISE_MAILTO}
                  className="text-brand hover:underline"
                >
                  {ENTERPRISE_CONTACT_EMAIL}
                </a>
                로 직접 메일
              </p>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}
