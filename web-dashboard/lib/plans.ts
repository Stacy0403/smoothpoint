import type { PlanType } from "@/types/database";

export const PLAN_FEATURES = {
  free: ["spline_basic", "watermark_branded"],
  pro: [
    "spline_basic",
    "calligraphy_mode",
    "custom_shortcuts",
    "watermark_removable",
  ],
  enterprise: [
    "spline_basic",
    "calligraphy_mode",
    "custom_shortcuts",
    "org_watermark",
  ],
} as const;

export type Feature = (typeof PLAN_FEATURES)[PlanType][number];

export const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "₩0",
    description: "기본 판서 보정",
    features: [
      "Spline 기본 보정",
      "SmoothPoint 워터마크",
      "글로벌 단축키 (기본)",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "₩9,900/월",
    description: "전문 강사를 위한 고급 기능",
    features: [
      "캘리그라피 모드",
      "워터마크 제거",
      "단축키 커스텀",
      "보정 강도 조절",
      "14일 무료 Trial",
    ],
    popular: true,
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "문의",
    description: "학원·기업 B2B",
    features: [
      "조직 로고 워터마크",
      "강사 라이선스 통합 관리",
      "좌석 기반 과금",
      "전담 지원",
    ],
  },
];

export function getFeaturesForPlan(plan: PlanType): Feature[] {
  return [...PLAN_FEATURES[plan]];
}

export function planLabel(plan: PlanType): string {
  return PLANS.find((p) => p.id === plan)?.name ?? plan;
}
