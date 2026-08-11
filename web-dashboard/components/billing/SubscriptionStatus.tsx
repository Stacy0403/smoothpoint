import type { PlanType } from "@/types/database";
import { planLabel } from "@/lib/plans";

export function SubscriptionStatus({
  planType,
  status,
  currentPeriodEnd,
  trialEnd,
}: {
  planType: PlanType;
  status?: string | null;
  currentPeriodEnd?: string | null;
  trialEnd?: string | null;
}) {
  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-slate-500">플랜</dt>
        <dd className="font-semibold">{planLabel(planType)}</dd>
      </div>
      <div>
        <dt className="text-slate-500">상태</dt>
        <dd className="font-semibold capitalize">{status ?? "없음"}</dd>
      </div>
      <div>
        <dt className="text-slate-500">갱신일</dt>
        <dd>{formatDate(currentPeriodEnd)}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Trial 종료</dt>
        <dd>{formatDate(trialEnd)}</dd>
      </div>
    </dl>
  );
}
