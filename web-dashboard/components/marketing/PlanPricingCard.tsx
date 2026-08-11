import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PLANS } from "@/lib/plans";
import type { PlanType } from "@/types/database";

function planCta(planId: PlanType) {
  if (planId === "enterprise") {
    return { label: "문의하기", href: "/contact?plan=enterprise" };
  }
  if (planId === "pro") {
    return { label: "14일 Trial", href: "/signup?plan=pro" };
  }
  return { label: "무료 시작", href: "/signup" };
}

export function PlanPricingCard({
  plan,
}: {
  plan: (typeof PLANS)[number];
}) {
  const cta = planCta(plan.id);

  return (
    <div
      className={`flex h-full flex-col rounded-xl border p-6 ${
        plan.popular ? "border-brand shadow-sm ring-1 ring-brand" : "border-slate-200"
      }`}
    >
      {plan.popular && (
        <span className="mb-2 inline-block w-fit rounded-full bg-brand px-3 py-0.5 text-xs text-white">
          인기
        </span>
      )}
      <h3 className="font-bold text-navy">{plan.name}</h3>
      <p className="mt-1 text-xl font-semibold text-brand">{plan.price}</p>
      {"description" in plan && (
        <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
      )}
      <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-600">
        {plan.features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <div className="mt-6">
        <Button
          href={cta.href}
          variant={plan.id === "enterprise" ? "secondary" : "primary"}
          className="w-full"
        >
          {cta.label}
        </Button>
      </div>
    </div>
  );
}

export function PlanPricingGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-6 md:grid-cols-3 ${className}`}>
      {PLANS.map((plan) => (
        <PlanPricingCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

export function PricingPageHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-navy">
          SmoothPoint
        </Link>
        <Button href="/signup">무료 시작</Button>
      </div>
    </header>
  );
}
