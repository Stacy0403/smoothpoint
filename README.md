# SmoothPoint

마우스와 트랙패드만으로 타블렛급 필기감을 구현하는 Rust 기반 초저지연 AI 판서 보정 SaaS.

## 프로젝트 구조

```
smoothpoint/
├── docs/              # PRD 문서
├── web-dashboard/     # Next.js 구독·B2B 웹 포털
├── src/               # Desktop React (오버레이 UI)
├── src-tauri/         # Rust 백엔드 (Spline 엔진, 글로벌 단축키)
└── supabase/          # DB 마이그레이션 참조
```

## Supabase

- **Project:** smoothpoint (`dhvaxmvzdecmrcdvqfco`)
- **Region:** ap-northeast-2
- **Tables:** `profiles`, `subscriptions`, `organizations`, `org_memberships`, `org_invites`
- **Storage:** `org-logos` bucket

## 빠른 시작

### 1. Web Dashboard

```bash
cd web-dashboard
cp .env.local.example .env.local
# .env.local에 Supabase anon key 입력
npm install
npm run dev
```

`http://localhost:3000` 에서 랜딩·가입·대시보드·Billing 사용

### 2. Desktop App

```bash
cp .env.example .env
# VITE_SUPABASE_ANON_KEY 설정
npm install
npm run tauri:dev
```

브라우저-only 테스트: `npm run dev` → `http://localhost:1420`

### 환경변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web + desktop | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | web (server) | Stripe webhook용 |
| `STRIPE_SECRET_KEY` | web | 결제 (미설정 시 dev 모드 Trial) |
| `VITE_API_BASE_URL` | desktop | License API (`http://localhost:3000`) |
| `NEXT_PUBLIC_GITHUB_REPO` | web | `owner/repo` — 다운로드 링크용 |

## Windows / macOS 릴리스 (GitHub Actions)

Desktop 설치 파일은 **GitHub Actions**에서 빌드됩니다 (cross-compile 대신 OS별 네이티브 빌드).

| 플랫폼 | 산출물 | Runner |
|--------|--------|--------|
| Windows | `SmoothPoint-setup.exe` (NSIS) | `windows-latest` |
| macOS | `SmoothPoint.dmg` | `macos-latest` |

### 최초 릴리스 방법

1. GitHub에 저장소 push
2. `web-dashboard/.env.local`에 설정:
   ```bash
   NEXT_PUBLIC_GITHUB_REPO=your-username/smoothpoint
   ```
3. 태그 push → Release 자동 생성:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. Actions **Release Desktop** 워크플로가 `.exe` / `.dmg`를 [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)에 업로드

수동 빌드: Actions → **Release Desktop** → Run workflow

### CI (PR / main push)

**Build Desktop** 워크플로가 Windows·macOS 빌드가 깨지지 않는지 검증합니다.

다운로드 URL (릴리스 후):
- Windows: `https://github.com/{owner}/{repo}/releases/latest/download/SmoothPoint-setup.exe`
- macOS: `https://github.com/{owner}/{repo}/releases/latest/download/SmoothPoint.dmg`

## 주요 기능

### Desktop (Tauri)
- Catmull-Rom Spline 실시간 보정 (`smooth_points` IPC)
- 투명 always-on-top 오버레이 + Click-Through
- 글로벌 단축키: Shift+D, Shift+1~5, `[`/`]`, Shift+Z, Shift+Esc
- HUD (색상·두께 0.5초 표시)
- 플랜별 워터마크 (Free / Enterprise)
- 시스템 트레이 메뉴

### Web (Next.js)
- 랜딩, Pricing, Download
- Supabase Auth (이메일/비밀번호)
- Dashboard, Billing, Organization, Settings
- `GET /api/v1/license/check` — Desktop 라이선스
- Stripe Checkout (또는 dev 모드 Pro Trial)
- B2B: 조직 생성, 멤버 초대, 로고 업로드

## 단축키 (Desktop)

| 단축키 | 동작 |
|--------|------|
| Shift+D | 판서 ON/OFF |
| Shift+1~5 | 색상 프리셋 |
| `[` / `]` | 두께 ±1 |
| Shift+Z | Undo |
| Shift+Esc | Click-Through |

## PRD

- [Desktop PRD](docs/PRD-desktop.md)
- [Web PRD](docs/PRD-web.md)
