"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { asTypedSupabase } from "@/lib/supabase/typed";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgToken = searchParams.get("org");
  const plan = searchParams.get("plan");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = asTypedSupabase(createClient());
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (orgToken && data.user) {
      const { data: invite } = await supabase
        .from("org_invites")
        .select("organization_id")
        .eq("token", orgToken)
        .is("accepted_at", null)
        .single();

      if (invite) {
        await supabase.from("org_memberships").insert({
          organization_id: invite.organization_id,
          user_id: data.user.id,
          role: "member",
          joined_at: new Date().toISOString(),
        });

        await supabase
          .from("profiles")
          .update({
            organization_id: invite.organization_id,
            plan_type: "enterprise",
          })
          .eq("id", data.user.id);

        await supabase
          .from("org_invites")
          .update({ accepted_at: new Date().toISOString() })
          .eq("token", orgToken);
      }
    }

    const dest =
      plan === "pro" ? "/dashboard/billing?upgrade=pro" : "/dashboard";
    router.push(dest);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-navy">회원가입</h1>
      {orgToken && (
        <p className="mb-4 rounded bg-blue-50 p-3 text-sm text-blue-800">
          조직 초대 링크로 가입 중입니다.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="이름"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
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
          label="비밀번호"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="6자 이상"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "가입 중..." : "가입하기"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-brand hover:underline">
          로그인
        </Link>
      </p>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  );
}
