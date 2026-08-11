import { createClient } from "@/lib/supabase/server";
import { asTypedSupabase } from "@/lib/supabase/typed";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SubscriptionStatus } from "@/components/billing/SubscriptionStatus";
import { planLabel } from "@/lib/plans";

export default async function DashboardPage() {
  const supabase = asTypedSupabase(await createClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const name = profile?.display_name ?? profile?.email?.split("@")[0] ?? "사용자";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-navy">안녕하세요, {name}님</h1>

      <Card title="현재 플랜">
        <SubscriptionStatus
          planType={profile?.plan_type ?? "free"}
          status={subscription?.status}
          currentPeriodEnd={subscription?.current_period_end}
          trialEnd={subscription?.trial_end}
        />
        <div className="mt-4 flex gap-3">
          <Button href="/dashboard/billing">플랜 변경</Button>
          <Button href="/dashboard/billing" variant="ghost">
            결제 관리
          </Button>
        </div>
      </Card>

      <Card title="Desktop 앱">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">연결 상태</dt>
            <dd>
              {profile?.last_license_check ? (
                <span className="text-green-600">✅ 연결됨</span>
              ) : (
                <span className="text-slate-400">미연결</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">마지막 확인</dt>
            <dd>
              {profile?.last_license_check
                ? new Date(profile.last_license_check).toLocaleString("ko-KR")
                : "-"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">워터마크</dt>
            <dd>
              {profile?.plan_type === "free"
                ? "SmoothPoint (강제)"
                : profile?.plan_type === "enterprise"
                  ? "조직 로고"
                  : "없음"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-3">
          <Button href="/download">Desktop 다운로드</Button>
        </div>
      </Card>

      <Card title="빠른 시작">
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
          <li>Desktop 앱 설치</li>
          <li>Desktop에서 {profile?.email} 계정으로 로그인</li>
          <li>
            <kbd className="rounded bg-slate-200 px-1">Shift+D</kbd>로 판서 시작
          </li>
        </ol>
        <p className="mt-4 text-sm">
          현재 플랜: <strong>{planLabel(profile?.plan_type ?? "free")}</strong>
        </p>
      </Card>
    </div>
  );
}
