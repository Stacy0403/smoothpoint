# SmoothPoint Web Dashboard PRD

| 항목 | 내용 |
|------|------|
| **문서 버전** | 1.0 |
| **작성일** | 2026-08-11 |
| **상태** | Draft |
| **플랫폼** | Web (Desktop/Mobile responsive) |
| **기술 스택** | Next.js 14+ (App Router), TypeScript, Supabase, Stripe |

---

## 1. 제품 개요

### 1.1 한 줄 정의

SmoothPoint Web Dashboard는 **구독·결제·계정·B2B 조직 관리**를 담당하는 SaaS 웹 포털로, 데스크톱 앱의 라이선스 정책을 중앙에서 제어한다.

### 1.2 웹의 역할 (Desktop과의 분리)

| 영역 | Web Dashboard | Desktop App |
|------|---------------|-------------|
| 회원가입·로그인 | ✅ 핵심 | 세션 소비 |
| 구독·결제 | ✅ 핵심 | ❌ |
| 플랜 업/다운그레이드 | ✅ | ❌ |
| B2B 조직·로고 관리 | ✅ (Enterprise) | 적용만 |
| 워터마크 정책 설정 | ✅ | 렌더링 |
| 판서·보정 | ❌ | ✅ 핵심 |

### 1.3 핵심 가치 제안

1. **14일 무료 트라이얼:** Stripe Trial로 Pro 기능 체험 후 전환
2. **셀프 서비스 구독:** 플랜 선택→결제→즉시 Desktop 라이선스 반영
3. **B2B 중앙 관리:** Enterprise 관리자가 강사 라이선스·브랜드 워터마크 일괄 제어
4. **투명한 사용량:** 현재 플랜, 갱신일, 결제 내역 한눈에 확인

### 1.4 성공 지표 (Web KPI)

| 지표 | 목표 (MVP) | 측정 |
|------|-----------|------|
| Trial → Paid 전환율 | ≥ 15% | Stripe + Supabase |
| Checkout 완료율 | ≥ 70% | Stripe Analytics |
| Time to First Login (가입→Desktop 로그인) | ≤ 5분 | Funnel |
| B2B Admin NPS | ≥ 40 | 설문 (P2) |
| 결제 실패 복구율 | ≥ 50% | Stripe dunning |

---

## 2. 사용자 정의

### 2.1 Primary Persona: 프리랜서 강사 (B2C)

- **목표:** Pro 구독으로 워터마크 제거 + 고급 보정 활성화
- **웹 사용 시나리오:** 랜딩 → 가입 → 14일 Trial → Desktop 다운로드 → 결제 정보 등록

### 2.2 Secondary Persona: 학원/기업 교육 담당자 (B2B)

- **목표:** 소속 강사 N명 라이선스 통합 관리, 학원 로고 워터마크 강제
- **웹 사용 시나리오:** Enterprise 문의 → 계약 → Admin 대시보드에서 강사 초대·로고 업로드

### 2.3 유저 스토리 & Acceptance Criteria

| ID | 스토리 | Acceptance Criteria |
|----|--------|---------------------|
| WS-01 | 강사로서, 웹에서 Pro 플랜을 구독하고 Desktop에서 즉시 Pro 기능을 쓰고 싶다 | 결제 완료 후 60초 이내 `license/check` API에 Pro 반영 |
| WS-02 | 강사로서, 14일 무료 Trial 없이 카드 등록 없이 Pro를 체험하고 싶다 | Trial 시작 시 Stripe `trial_period_days: 14`, Trial 중 해지 가능 |
| WS-03 | 강사로서, 결제 수단과 구독을 셀프로 관리하고 싶다 | Stripe Customer Portal 링크 제공, 플랜 변경·취소 가능 |
| WS-04 | 관리자로서, 모든 강사 화면에 학원 로고 워터마크를 적용하고 싶다 | Enterprise Admin이 logo 업로드 → 소속 강사 Desktop에 5분 내 반영 |
| WS-05 | 관리자로서, 강사별 라이선스를 초대·회수하고 싶다 | 이메일 초대 → 수락 시 org 멤버십, 회수 시 Free 전환 |

---

## 3. 기능 명세

### 3.1 인증 (Auth) — P0

#### 지원 방식
- 이메일 + 비밀번호 (Supabase Auth)
- 소셜 로그인: Google, Apple (MVP), GitHub (P2)
- Magic Link (P2)

#### 화면
- `/login` — 로그인
- `/signup` — 회원가입 (+ 이용약관·개인정보 동의)
- `/forgot-password` — 비밀번호 재설정
- `/auth/callback` — OAuth callback

#### 비즈니스 규칙
- 이메일 인증 필수 (Desktop 라이선스 활성화 전)
- Desktop OAuth: PKCE flow, deep link `smoothpoint://auth/callback`
- 세션 TTL: 7일 (refresh token)

---

### 3.2 랜딩 & 마케팅 페이지 — P0

#### URL: `/`

#### 섹션 구성
1. **Hero:** "마우스만으로 타블렛급 필기" + CTA (무료 시작 / Desktop 다운로드)
2. **데모 영상/GIF:** 보정 전후 비교
3. **핵심 기능 3가지:** Spline 보정, 글로벌 HUD, 투명 오버레이
4. **요금제 비교표** (Free / Pro / Enterprise)
5. **FAQ**
6. **Footer:** 이용약관, 개인정보, 문의

#### CTA 흐름
```
[무료 시작] → /signup → /dashboard (Free)
[Pro Trial] → /signup?plan=pro → Stripe Checkout (Trial)
[Desktop 다운로드] → OS별 dmg/exe (GitHub Releases or CDN)
```

---

### 3.3 대시보드 홈 — P0

#### URL: `/dashboard`

#### 레이아웃
```
┌─ Sidebar ─┬─ Main ─────────────────────────────────────┐
│ 🏠 홈      │  안녕하세요, {name}님                        │
│ 💳 구독    │                                              │
│ 🏢 조직    │  ┌─ 현재 플랜 ─────────────────────────────┐  │
│ ⚙️ 설정    │  │  Pro · 2026-09-11 갱신                 │  │
│            │  │  [플랜 변경]  [결제 관리]               │  │
│            │  └────────────────────────────────────────┘  │
│            │                                              │
│            │  ┌─ Desktop 앱 ────────────────────────────┐  │
│            │  │  ✅ 연결됨 · macOS · v1.0.0              │  │
│            │  │  [Desktop 다운로드]  [로그아웃 (Desktop)]│  │
│            │  └────────────────────────────────────────┘  │
│            │                                              │
│            │  ┌─ 빠른 시작 ─────────────────────────────┐  │
│            │  │  1. Desktop 설치  2. 로그인  3. 판서!   │  │
│            │  └────────────────────────────────────────┘  │
└────────────┴──────────────────────────────────────────────┘
```

#### 표시 정보
- 현재 `plan_type`, 갱신일, Trial 잔여일
- Desktop 연결 상태 (마지막 license check timestamp)
- 워터마크 상태 (Free: SmoothPoint / Enterprise: org logo)

---

### 3.4 구독 & 결제 — P0

#### URL: `/dashboard/billing`

#### 요금제 정의

| | Free | Pro | Enterprise |
|---|------|-----|------------|
| **가격** | ₩0 | ₩9,900/월 | 문의 (좌석당) |
| **Trial** | - | 14일 | - |
| **Spline 기본 보정** | ✅ | ✅ | ✅ |
| **캘리그라피 모드** | ❌ | ✅ | ✅ |
| **워터마크** | SmoothPoint | 제거 가능 | 조직 로고 |
| **단축키 커스텀** | ❌ | ✅ | ✅ |
| **B2B 관리** | ❌ | ❌ | ✅ |
| **좌석 수** | 1 | 1 | N |

#### Stripe 연동 흐름

```
[플랜 선택] → POST /api/v1/checkout/create-session
           → Stripe Checkout (hosted)
           → success_url: /dashboard/billing?success=1
           → Webhook: checkout.session.completed
           → Supabase subscriptions 업데이트
           → Desktop license/check 즉시 반영
```

#### Billing 페이지 기능
- 현재 구독 상태 (active, trialing, past_due, canceled)
- **플랜 업그레이드/다운그레이드** (Stripe proration)
- **결제 수단 관리** → Stripe Customer Portal redirect
- **청구서 목록** (Stripe invoices)
- **구독 취소** (기간 종료 시 Free 전환)

#### Webhook Events (필수)
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

### 3.5 B2B 조직 관리 — P1 (Enterprise)

#### URL: `/dashboard/organization`

> Enterprise Admin (`Organizations.admin_id`)만 접근

#### 기능

| 기능 | 설명 |
|------|------|
| 조직 프로필 | 이름, logo_url 업로드 (Supabase Storage) |
| 멤버 초대 | 이메일 초대 → 가입/로그인 시 org 자동 연결 |
| 멤버 목록 | 이름, 이메일, 상태, 마지막 활동 |
| 멤버 회수 | org 제거 → Free 전환 |
| 워터마크 설정 | 위치(우하), opacity, 크기 (Desktop 정책 JSON) |
| 좌석 관리 | 구매 좌석 수 vs 사용 중 |

#### 로고 업로드 스펙
- 형식: PNG, SVG (투명 배경 권장)
- 최대: 2MB
- Storage path: `organizations/{org_id}/logo.{ext}`
- CDN URL → `Organizations.logo_url` → Desktop license API 응답

#### 초대 흐름
```
Admin [강사 초대] → POST /api/v1/org/invite { email }
                 → Supabase invite email
                 → 강사 /signup?org={invite_token}
                 → org_memberships insert
                 → Desktop: organization_logo_url 적용
```

---

### 3.6 계정 설정 — P1

#### URL: `/dashboard/settings`

- 프로필: 이름, 이메일 변경
- 비밀번호 변경
- Desktop 세션 관리 (활성 기기 목록, 원격 로그아웃)
- 알림 설정 (결제 실패, Trial 종료 D-3)
- 계정 삭제 (GDPR, 구독 취소 후)

---

### 3.7 License API (Web Backend) — P0

> Next.js Route Handlers 또는 Supabase Edge Functions

#### `GET /api/v1/license/check`

**Request**
```
Authorization: Bearer {supabase_jwt}
```

**Response 200**
```json
{
  "user_id": "uuid",
  "plan_type": "pro",
  "features": [
    "spline_basic",
    "calligraphy_mode",
    "custom_shortcuts",
    "watermark_removable"
  ],
  "watermark": {
    "type": "none",
    "url": null
  },
  "organization": null,
  "subscription": {
    "status": "active",
    "current_period_end": "2026-09-11T00:00:00Z",
    "trial_end": null
  }
}
```

**Enterprise Response 예시**
```json
{
  "plan_type": "enterprise",
  "watermark": {
    "type": "organization",
    "url": "https://cdn.smoothpoint.app/org/abc/logo.png",
    "position": "bottom-right",
    "opacity": 0.7,
    "width": 160,
    "height": 48
  },
  "organization": {
    "id": "uuid",
    "name": "OO학원"
  }
}
```

#### `POST /api/v1/checkout/create-session`

**Request**
```json
{
  "price_id": "price_xxx",
  "success_url": "https://app.smoothpoint.app/dashboard/billing?success=1",
  "cancel_url": "https://app.smoothpoint.app/dashboard/billing"
}
```

**Response**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

---

## 4. 화면 목록 (Sitemap)

```
smoothpoint.app/
├── /                          # 랜딩
├── /pricing                   # 요금제 상세
├── /download                  # Desktop 다운로드
├── /login
├── /signup
├── /forgot-password
├── /auth/callback
├── /dashboard                 # 홈
├── /dashboard/billing         # 구독·결제
├── /dashboard/organization    # B2B (Enterprise Admin)
├── /dashboard/settings        # 계정 설정
├── /legal/terms
├── /legal/privacy
└── /api/v1/
    ├── license/check
    ├── checkout/create-session
    ├── webhooks/stripe
    └── org/invite
```

---

## 5. 데이터 모델

### 5.1 Supabase Tables

#### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | = auth.users.id |
| email | text | |
| display_name | text | |
| plan_type | enum | free, pro, enterprise |
| watermark_url | text nullable | 사용자 커스텀 (Pro, P2) |
| organization_id | uuid FK nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | profiles.id |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| status | enum | active, trialing, past_due, canceled, incomplete |
| price_id | text | Stripe price |
| current_period_end | timestamptz | |
| trial_end | timestamptz nullable | |
| created_at | timestamptz | |

#### `organizations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | |
| logo_url | text | Supabase Storage CDN |
| admin_id | uuid FK | profiles.id |
| seat_limit | int | Enterprise 좌석 |
| watermark_config | jsonb | position, opacity, size |
| created_at | timestamptz | |

#### `org_memberships`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | |
| user_id | uuid FK | profiles.id |
| role | enum | admin, member |
| invited_at | timestamptz | |
| joined_at | timestamptz nullable | |

#### `org_invites`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | |
| email | text | |
| token | text unique | |
| expires_at | timestamptz | |
| accepted_at | timestamptz nullable | |

### 5.2 RLS (Row Level Security) 정책

- `profiles`: 본인 row만 read/update
- `subscriptions`: 본인 row만 read
- `organizations`: admin read/write, member read-only
- `org_memberships`: admin CRUD, member read own

---

## 6. API 설계 (전체)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | Supabase `/auth/v1/signup` | - | 회원가입 |
| POST | Supabase `/auth/v1/token` | - | 로그인 |
| GET | `/api/v1/license/check` | JWT | Desktop/Web 라이선스 |
| GET | `/api/v1/user/profile` | JWT | 프로필 조회 |
| PATCH | `/api/v1/user/profile` | JWT | 프로필 수정 |
| POST | `/api/v1/checkout/create-session` | JWT | Stripe Checkout |
| POST | `/api/v1/webhooks/stripe` | Stripe Sig | Webhook |
| GET | `/api/v1/billing/portal` | JWT | Stripe Portal URL |
| POST | `/api/v1/org/invite` | JWT (Admin) | 멤버 초대 |
| DELETE | `/api/v1/org/members/{id}` | JWT (Admin) | 멤버 회수 |
| POST | `/api/v1/org/logo` | JWT (Admin) | 로고 업로드 |
| GET | `/api/v1/org` | JWT (Member+) | 조직 정보 |

---

## 7. 인증 및 권한

### 7.1 Role Matrix

| 리소스 | Anonymous | Free User | Pro User | Org Member | Org Admin |
|--------|-----------|-----------|----------|------------|-----------|
| 랜딩/가격 | R | R | R | R | R |
| Dashboard | - | R | R | R | R |
| Billing 변경 | - | Upgrade | R/W | R | R |
| Org 관리 | - | - | - | R | R/W |
| Logo 업로드 | - | - | - | - | W |

### 7.2 Plan → Feature Flag Mapping

```typescript
const PLAN_FEATURES = {
  free: ['spline_basic', 'watermark_branded'],
  pro: ['spline_basic', 'calligraphy_mode', 'custom_shortcuts', 'watermark_removable'],
  enterprise: ['spline_basic', 'calligraphy_mode', 'custom_shortcuts', 'org_watermark'],
} as const;
```

---

## 8. UI/UX 가이드

### 8.1 디자인 원칙
- **Professional & Trustworthy:** 교육 SaaS 톤, 네이비 + 화이트 + 포인트 블루
- **Minimal friction:** 가입→결제 3클릭 이내
- **Mobile-friendly:** Dashboard는 모바일에서도 구독 관리 가능 (판서 X)

### 8.2 Responsive Breakpoints
- Mobile: < 768px (sidebar → hamburger)
- Tablet: 768–1024px
- Desktop: > 1024px

### 8.3 Empty States
- Free 사용자 Billing: "Pro로 업그레이드하고 워터마크를 제거하세요"
- Enterprise Admin, 멤버 0명: "첫 강사를 초대하세요" CTA

---

## 9. 프로젝트 구조

```
web-dashboard/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # 랜딩
│   │   ├── pricing/page.tsx
│   │   └── download/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── auth/callback/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx            # Sidebar layout
│   │   ├── page.tsx
│   │   ├── billing/page.tsx
│   │   ├── organization/page.tsx
│   │   └── settings/page.tsx
│   └── api/v1/
│       ├── license/check/route.ts
│       ├── checkout/create-session/route.ts
│       ├── webhooks/stripe/route.ts
│       └── org/
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── billing/
│   │   ├── PlanCard.tsx
│   │   └── SubscriptionStatus.tsx
│   └── org/
│       ├── MemberTable.tsx
│       └── LogoUpload.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stripe.ts
│   └── plans.ts
└── middleware.ts                 # Auth guard
```

---

## 10. 환경변수

| 변수 | 설명 | 노출 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API (webhook) | Server only |
| `STRIPE_SECRET_KEY` | Stripe API | Server only |
| `STRIPE_WEBHOOK_SECRET` | Webhook 검증 | Server only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout | Client |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro price ID | Server |
| `NEXT_PUBLIC_APP_URL` | https://app.smoothpoint.app | Client |

---

## 11. 개발 로드맵

### Phase 0 — Auth & Landing (2주)
- [ ] Next.js 프로젝트 + Supabase Auth
- [ ] 랜딩 페이지, `/pricing`
- [ ] Login / Signup / Password reset
- [ ] Dashboard shell (sidebar layout)

### Phase 1 — Billing (3주)
- [ ] Stripe Checkout + 14-day Trial
- [ ] Webhook handlers → subscriptions sync
- [ ] `/dashboard/billing` UI
- [ ] `GET /api/v1/license/check` API
- [ ] Stripe Customer Portal 연동

### Phase 2 — Enterprise B2B (3주)
- [ ] organizations, org_memberships schema + RLS
- [ ] Admin: 멤버 초대/회수
- [ ] Logo upload (Supabase Storage)
- [ ] `/dashboard/organization` UI
- [ ] License API org watermark 응답

### Phase 3 — Polish (2주)
- [ ] 이메일 알림 (Trial D-3, payment failed)
- [ ] `/download` OS별 링크
- [ ] SEO, OG tags
- [ ] Analytics (Plausible/PostHog)

---

## 12. 리스크 & Mitigation

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Stripe Webhook 누락 | 라이선스 불일치 | Idempotency key, webhook retry log, manual reconcile admin |
| Trial abuse (다중 가입) | 매출 손실 | 이메일+카드 fingerprint 중복 체크 (P2) |
| Enterprise 수동 계약 | 온보딩 지연 | Admin panel 수동 org 생성 + invoice |
| Supabase RLS misconfiguration | 데이터 유출 | RLS unit test, security audit |

---

## 13. Out of Scope (Web MVP)

- 인앱 판서 데모 (Desktop 설치 유도)
- 다국어 (i18n) — 한국어 MVP, 영어 P2
- Affiliate / referral program
- Usage-based billing
- SSO/SAML (Enterprise P2)
- Admin super-panel (internal ops P2)

---

## 14. 부록: Stripe Product Setup

```
Product: SmoothPoint Pro
  └── Price: price_pro_monthly (₩9,900/month, recurring)
      └── Trial: 14 days

Product: SmoothPoint Enterprise
  └── Price: price_enterprise_seat (per-seat, custom)
      └── No self-serve checkout → "Contact Sales" form
```

### Webhook → DB Mapping

| Stripe Event | DB Action |
|--------------|-----------|
| `checkout.session.completed` | Insert/update subscriptions, set plan_type |
| `customer.subscription.updated` | Update status, current_period_end |
| `customer.subscription.deleted` | plan_type → free, status → canceled |
| `invoice.payment_failed` | status → past_due, email alert |
