"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${appUrl}/auth/callback?next=/dashboard/settings` }
    );

    if (authError) {
      setError(authError.message);
    } else {
      setMessage("비밀번호 재설정 링크를 이메일로 보냈습니다.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-navy">비밀번호 재설정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-brand hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </Card>
    </div>
  );
}
