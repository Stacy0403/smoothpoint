"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlanCard } from "@/components/billing/PlanCard";
import { SubscriptionStatus } from "@/components/billing/SubscriptionStatus";
import { PLANS } from "@/lib/plans";
import type { PlanType } from "@/types/database";

interface ProfileData {
  profile: { plan_type: PlanType; email: string };
  subscription: {
    status: string;
    current_period_end: string | null;
    trial_end: string | null;
  } | null;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/user/profile")
      .then((r) => r.json())
      .then(setData);

    if (searchParams.get("success")) {
      setMessage("구독이 성공적으로 처리되었습니다!");
    }
    if (searchParams.get("dev")) {
      setMessage("개발 모드: Pro Trial이 활성화되었습니다.");
    }
  }, [searchParams]);

  async function handleSelectPlan(plan: PlanType) {
    if (plan !== "pro") return;
    setLoading(true);

    const res = await fetch("/api/v1/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const result = await res.json();
    if (result.url) {
      window.location.href = result.url;
    } else {
      setMessage(result.error ?? "오류가 발생했습니다.");
      setLoading(false);
    }
  }

  async function openPortal() {
    const res = await fetch("/api/v1/billing/portal");
    const result = await res.json();
    if (result.url) window.location.href = result.url;
  }

  const planType = data?.profile?.plan_type ?? "free";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-navy">구독 & 결제</h1>

      {message && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          {message}
        </div>
      )}

      <Card title="현재 구독">
        <SubscriptionStatus
          planType={planType}
          status={data?.subscription?.status}
          currentPeriodEnd={data?.subscription?.current_period_end}
          trialEnd={data?.subscription?.trial_end}
        />
        {planType !== "free" && (
          <Button variant="ghost" className="mt-4" onClick={openPortal}>
            결제 수단 관리 (Stripe Portal)
          </Button>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            {...plan}
            currentPlan={planType}
            onSelect={handleSelectPlan}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
