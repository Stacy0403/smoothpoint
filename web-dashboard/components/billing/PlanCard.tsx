"use client";

import { Button } from "@/components/ui/Button";
import type { PlanType } from "@/types/database";

export function PlanCard({
  id,
  name,
  price,
  description,
  features,
  popular,
  currentPlan,
  onSelect,
  loading,
}: {
  id: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  currentPlan: PlanType;
  onSelect: (plan: PlanType) => void;
  loading?: boolean;
}) {
  const isCurrent = currentPlan === id;

  return (
    <div
      className={`relative rounded-xl border p-6 ${
        popular ? "border-brand shadow-md" : "border-slate-200"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-4 rounded-full bg-brand px-3 py-0.5 text-xs text-white">
          인기
        </span>
      )}
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="mt-1 text-2xl font-semibold text-brand">{price}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-green-500">✓</span> {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {isCurrent ? (
          <Button variant="ghost" className="w-full" disabled>
            현재 플랜
          </Button>
        ) : id === "enterprise" ? (
          <Button href="/contact?plan=enterprise" variant="secondary" className="w-full">
            문의하기
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            disabled={loading}
            onClick={() => onSelect(id)}
          >
            {loading ? "처리 중..." : id === "pro" ? "Pro Trial 시작" : "선택"}
          </Button>
        )}
      </div>
    </div>
  );
}
