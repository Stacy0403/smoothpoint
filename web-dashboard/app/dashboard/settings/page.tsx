"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/v1/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setDisplayName(data.profile?.display_name ?? "");
        setEmail(data.profile?.email ?? "");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/v1/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-navy">설정</h1>

      <Card title="프로필">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="이름"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input label="이메일" id="email" value={email} disabled />
          {saved && <p className="text-sm text-green-600">저장되었습니다.</p>}
          <Button type="submit">저장</Button>
        </form>
      </Card>

      <Card title="계정">
        <Button variant="ghost" onClick={handleLogout} className="text-red-600">
          로그아웃
        </Button>
      </Card>
    </div>
  );
}
