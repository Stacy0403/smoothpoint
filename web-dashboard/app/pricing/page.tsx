import {
  PlanPricingGrid,
  PricingPageHeader,
} from "@/components/marketing/PlanPricingCard";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PricingPageHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-center text-3xl font-bold">요금제</h1>
        <p className="mt-2 text-center text-slate-600">
          필요에 맞는 플랜을 선택하세요
        </p>
        <PlanPricingGrid className="mt-12" />
      </main>
    </div>
  );
}
