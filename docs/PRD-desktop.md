# SmoothPoint Desktop Application PRD

| 항목 | 내용 |
|------|------|
| **문서 버전** | 1.0 |
| **작성일** | 2026-08-11 |
| **상태** | Draft |
| **플랫폼** | macOS, Windows (MVP: macOS 우선) |
| **기술 스택** | Tauri 2.x, Rust, React, TypeScript |

---

## 1. 제품 개요

### 1.1 한 줄 정의

SmoothPoint Desktop은 **시스템 최상위 투명 오버레이** 위에서 마우스·트랙패드 입력을 **Rust 기반 Catmull-Rom Spline 엔진**으로 실시간 보정하여, 타블렛 없이도 타블렛급 필기감을 제공하는 네이티브 데스크톱 애플리케이션이다.

### 1.2 데스크톱 앱의 역할 (웹과의 분리)

| 영역 | Desktop App | Web Dashboard |
|------|-------------|---------------|
| 판서·보정 | ✅ 핵심 | ❌ |
| 글로벌 단축키·HUD | ✅ 핵심 | ❌ |
| 투명 오버레이 | ✅ 핵심 | ❌ |
| 구독·결제 | ❌ (조회만) | ✅ 핵심 |
| B2B 로고 업로드 | ❌ (적용만) | ✅ 핵심 |

### 1.3 핵심 가치 제안

1. **0ms 체감 지연:** Rust 네이티브 엔진으로 입력→보정→렌더링 파이프라인 최소화
2. **끊김 없는 강의:** 백그라운드 상태에서도 글로벌 단축키 + 커서 추적 HUD
3. **어디서나 판서:** Zoom, PowerPoint, 브라우저 등 **모든 앱 위** 투명 레이어 오버레이
4. **경량 실행:** Electron 대비 메모리 점유 3% 미만 목표 (Tauri)

### 1.4 성공 지표 (Desktop KPI)

| 지표 | 목표 (MVP) | 측정 방법 |
|------|-----------|----------|
| 입력→렌더 지연 | ≤ 16ms (60fps) | Rust 벤치마크 + 프로파일러 |
| 메모리 사용량 (idle) | ≤ 80MB | Activity Monitor / Task Manager |
| 첫 판서까지 시간 | ≤ 30초 (온보딩 포함) | 사용자 테스트 |
| 크래시율 | < 0.1% / 세션 | Sentry (P2) |
| D7 Retention | ≥ 40% | Supabase Analytics |

---

## 2. 사용자 정의

### 2.1 Primary Persona: 전문 프리랜서 강사

- **프로필:** 1타 강사, 개인 과외, Zoom/화상 강의 위주
- **Pain Point:** 마우스 필기가 지저분해 강의 신뢰도 하락, 타블렛 구매 부담
- **Desktop 사용 시나리오:** 강의 5분 전 앱 실행 → 오버레이 활성화 → 강의 중 단축키로 색·두께 변경

### 2.2 Secondary Persona: B2B 강사 (Enterprise 소속)

- **프로필:** 학원/기업 소속 강사, 관리자가 라이선스·워터마크 정책 설정
- **Desktop 사용 시나리오:** 로그인 시 조직 워터마크 자동 적용, 개별 워터마크 제거 불가

### 2.3 유저 스토리 & Acceptance Criteria

| ID | 스토리 | Acceptance Criteria |
|----|--------|---------------------|
| DS-01 | 강사로서, 마우스 드래그 시 선이 자동으로 매끄럽게 보정되길 원한다 | Catmull-Rom 보정 적용 시 각도 급변 ≤ 15°, Pro 플랜에서 캘리그라피 모드 활성 |
| DS-02 | 강사로서, 강의 중 화면 전환 없이 단축키로 펜 색상을 바꾸고 싶다 | `Shift+1~5` 입력 시 200ms 이내 색상 변경, HUD 0.5초 노출 |
| DS-03 | 강사로서, 판서하지 않을 때 아래 앱을 정상 클릭하고 싶다 | Click-Through 모드 ON 시 마우스 이벤트 하위 창 전달 100% |
| DS-04 | 강사로서, 앱을 최소화해도 단축키가 동작하길 원한다 | 트레이/백그라운드 상태에서 Global Hotkey 정상 동작 |
| DS-05 | 관리자(Enterprise)로서, 소속 강사 화면에 학원 로고가 항상 보이길 원한다 | Enterprise 플랜 로그인 시 조직 logo_url 워터마크 강제, 위치·크기 서버 정책 준수 |

---

## 3. 기능 명세

### 3.1 Rust-Spline 보정 엔진 (P0)

#### 설명
마우스/트랙패드 raw 좌표 `(x, y, t, pressure?)`를 Catmull-Rom Spline으로 보간하여 베지에 곡선 스트로크로 변환한다.

#### 사용자 흐름
```
[마우스 Down] → raw points 수집 → Spline 보정 (Rust) → GPU/CPU 렌더 → [마우스 Up] → 스트로크 확정
```

#### 기능 상세

| 항목 | Free/Lite | Pro | Enterprise |
|------|-----------|-----|------------|
| 기본 Spline 보정 | ✅ | ✅ | ✅ |
| 캘리그라피 모드 (압력 시뮬레이션, 속도 기반 두께) | ❌ | ✅ | ✅ |
| 보정 강도 슬라이더 (0~100) | 고정 50 | 0~100 | 0~100 |
| 최대 동시 스트로크 | 1 | 1 | 1 |

#### 기술 요구사항
- **알고리즘:** Catmull-Rom Spline, 4-point sliding window
- **입력 샘플링:** ≥ 120Hz (OS 이벤트 기준)
- **출력:** SVG path 또는 GPU line strip
- **Tauri IPC:** `invoke('stroke_append', { points })` → `invoke('stroke_rendered', { path })`

#### 비즈니스 규칙
- 라이선스 API 응답의 `plan_type`에 따라 엔진 모드 분기
- 오프라인 시 마지막 캐시된 라이선스 TTL 24시간 (이후 기본 보정 + 워터마크)

---

### 3.2 글로벌 퀵 팔레트 & HUD (P0)

#### 설명
앱이 백그라운드/트레이 상태여도 OS 글로벌 단축키를 감지하고, 마우스 커서 근처에 현재 펜 설정 HUD를 표시한다.

#### 단축키 (기본값, Pro에서 커스텀 가능)

| 입력 | 동작 |
|------|------|
| `Shift + 1` ~ `Shift + 5` | 프리셋 색상 1~5 선택 |
| `[` | 펜 두께 -1 (min: 1px) |
| `]` | 펜 두께 +1 (max: 20px) |
| `Shift + D` | 판서 모드 ON/OFF 토글 |
| `Shift + Z` | 마지막 스트로크 Undo |
| `Shift + Esc` | Click-Through 모드 토글 |

#### HUD UI 스펙

```
┌─────────────────────┐
│  ● 빨강  │  두께: 4  │
└─────────────────────┘
  ↑ 커서 오른쪽 하단 12px offset
  ↑ opacity 0.9, border-radius 8px
  ↑ 표시 시간: 500ms (fade-out 150ms)
```

#### 기술 요구사항
- **macOS:** `CGEventTap` 또는 Tauri global shortcut plugin
- **Windows:** `RegisterHotKey` Win32 API
- HUD는 React 오버레이 레이어, Tauri `set_position`으로 커서 추적 (60fps throttle)

---

### 3.3 투명 오버레이 캔버스 (P0)

#### 설명
전체 화면 또는 다중 모니터를 덮는 **always-on-top, transparent, frameless** 윈도우. 판서 모드에서만 입력을 캡처한다.

#### 모드 정의

| 모드 | 입력 캡처 | 클릭 전달 | 시각 |
|------|----------|----------|------|
| **Click-Through** (기본) | ❌ | ✅ 하위 창 | 완전 투명 |
| **Drawing** | ✅ | ❌ | 스트로크만 표시 |
| **Drawing + HUD** | ✅ (펜만) | ❌ | 스트로크 + HUD |

#### 사용자 흐름
1. 앱 실행 → 시스템 트레이 아이콘 표시
2. `Shift + D` 또는 트레이 메뉴 "판서 시작" → Drawing 모드
3. 판서 완료 → `Shift + D` 또는 자동 Click-Through 복귀 (설정 가능)

#### macOS 권한 요구 (P1)
- **Accessibility (손쉬운 사용):** 글로벌 단축키
- **Screen Recording:** 일부 오버레이 렌더링 (OS 버전별)
- 온보딩 1회: 권한 미부여 시 설정 가이드 모달 + System Settings 딥링크

#### Windows 요구 (P1)
- 관리자 권한 불필요 (MVP)
- DPI awareness per-monitor V2

---

### 3.4 설정 윈도우 (P0)

#### 화면 구조

```
┌─ SmoothPoint Settings ─────────────────────┐
│  [일반] [단축키] [보정] [계정] [정보]          │
├──────────────────────────────────────────────┤
│  일반                                         │
│  ├─ 시작 시 트레이 최소화          [toggle]   │
│  ├─ 판서 종료 후 Click-Through 자동  [toggle] │
│  └─ 다중 모니터 오버레이           [toggle]   │
│                                               │
│  보정 (Pro+)                                  │
│  ├─ 보정 강도  [━━━━●━━━━] 72                 │
│  └─ 캘리그라피 모드               [toggle]    │
│                                               │
│  계정                                         │
│  ├─ 이메일: user@example.com                  │
│  ├─ 플랜: Pro (2026-09-11 갱신)               │
│  └─ [웹 대시보드에서 관리]  [로그아웃]         │
└──────────────────────────────────────────────┘
```

#### 기능
- 단축키 커스텀 (Pro+): 충돌 감지 및 경고
- 보정 강도 실시간 미리보기 (미니 캔버스)
- Supabase Auth 세션 표시, 웹 대시보드 외부 링크
- 앱 버전, 업데이트 확인 (P2)

---

### 3.5 라이선스 연동 (P1)

#### 설명
데스크톱은 **라이선스 소비자**. 결제·플랜 변경은 웹 대시보드에서 수행.

#### 클라이언트 흐름
```
[앱 시작] → Supabase Auth 토큰 확인
         → GET /api/v1/license/check
         → 로컬 캐시 (encrypted, TTL 1h)
         → plan_type에 따라 엔진·워터마크·단축키 정책 적용
```

#### 플랜별 Desktop 기능 매트릭스

| 기능 | Free | Pro | Enterprise |
|------|------|-----|------------|
| 기본 Spline 보정 | ✅ | ✅ | ✅ |
| 캘리그라피 모드 | ❌ | ✅ | ✅ |
| 단축키 커스텀 | ❌ | ✅ | ✅ |
| SmoothPoint 워터마크 | 강제 | 제거 가능 | ❌ |
| 조직 로고 워터마크 | ❌ | ❌ | 강제 |
| 보정 강도 조절 | ❌ | ✅ | ✅ |

#### 워터마크 스펙
- **Free:** 우측 하단, "SmoothPoint" 텍스트 + 로고, opacity 0.6, 크기 120×32px
- **Enterprise:** 서버 `Organizations.logo_url`, 위치 우측 하단, opacity 0.7, 크기 160×48px, 강사 개별 비활성화 불가

---

### 3.6 시스템 트레이 & 온보딩 (P1)

#### 트레이 메뉴
- 판서 시작/종료
- Click-Through 토글
- 설정 열기
- 웹 대시보드 열기
- 종료

#### 온보딩 (최초 실행)
1. 환영 + 제품 소개 (3 slide)
2. macOS 권한 요청 가이드
3. 단축키 튜토리얼 (인터랙티브)
4. 테스트 판서 (미니 데모 캔버스)
5. 로그인/회원가입 (웹 OAuth redirect 또는 embedded)

---

## 4. 화면 목록 (Information Architecture)

```
SmoothPoint Desktop
├── Overlay Layer (fullscreen, transparent)
│   ├── Drawing Canvas
│   ├── HUD (cursor-following)
│   └── Watermark
├── Settings Window
│   ├── General
│   ├── Shortcuts
│   ├── Smoothing
│   ├── Account
│   └── About
├── Onboarding Window (first launch)
└── System Tray Menu
```

---

## 5. 데이터 모델 (Client-side)

### 5.1 Local Settings (SQLite / Tauri Store)

```typescript
interface LocalSettings {
  pen_color: string;           // hex, default '#FF0000'
  pen_width: number;           // 1-20, default 4
  color_presets: string[];     // 5 colors
  shortcuts: ShortcutMap;      // Pro+ only
  smoothing_strength: number;  // 0-100
  auto_click_through: boolean;
  minimize_to_tray: boolean;
  multi_monitor: boolean;
}
```

### 5.2 License Cache

```typescript
interface LicenseCache {
  user_id: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  features: string[];
  watermark_url: string | null;
  organization_logo_url: string | null;
  expires_at: string;          // ISO8601
  cached_at: string;
}
```

### 5.3 Stroke (Session, 비영구 MVP)

```typescript
interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}
```

---

## 6. API 연동 (Desktop Client)

| Method | Endpoint | 용도 | Auth |
|--------|----------|------|------|
| POST | Supabase Auth `/auth/v1/token` | 로그인/토큰 갱신 | - |
| GET | `/api/v1/license/check` | 플랜·기능·워터마크 | Bearer JWT |
| GET | `/api/v1/user/profile` | 프로필 조회 | Bearer JWT |

> 결제·구독 변경 API는 Web Dashboard 전용. Desktop은 deep link로 웹 열기.

---

## 7. 비기능 요구사항

### 7.1 성능
- Cold start: ≤ 2초 (M1 Mac 기준)
- Stroke render: ≤ 16ms/frame
- Global hotkey latency: ≤ 50ms

### 7.2 보안
- Auth token: OS Keychain / Windows Credential Manager
- License cache: AES-256 로컬 암호화
- IPC: Tauri capability 기반 최소 권한

### 7.3 호환성
- **MVP:** macOS 13+ (Ventura), Apple Silicon + Intel
- **P2:** Windows 10 21H2+

### 7.4 접근성
- 단축키 전 기능 키보드 접근 가능
- HUD 색상 대비 WCAG AA

---

## 8. 프로젝트 구조

```
smoothpoint/
├── src-tauri/
│   ├── src/
│   │   ├── engine/
│   │   │   ├── mod.rs
│   │   │   ├── catmull_rom.rs    # Spline 알고리즘
│   │   │   └── calligraphy.rs    # Pro 캘리그라피 모드
│   │   ├── overlay/
│   │   │   ├── mod.rs
│   │   │   ├── window.rs         # 투명 always-on-top
│   │   │   └── click_through.rs
│   │   ├── hotkey/
│   │   │   └── mod.rs            # 글로벌 단축키
│   │   ├── license/
│   │   │   └── mod.rs            # API 연동 + 캐시
│   │   └── main.rs
│   ├── capabilities/
│   └── tauri.conf.json
├── src/                            # React (Overlay + Settings)
│   ├── components/
│   │   ├── OverlayCanvas.tsx
│   │   ├── HUD.tsx
│   │   ├── Watermark.tsx
│   │   └── settings/
│   ├── hooks/
│   │   ├── useTauriInvoke.ts
│   │   ├── useLicense.ts
│   │   └── useGlobalShortcut.ts
│   └── App.tsx
└── package.json
```

---

## 9. 환경변수

| 변수 | 설명 | 노출 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | Client |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Client |
| `VITE_API_BASE_URL` | License API base | Client |
| `TAURI_SIGNING_PRIVATE_KEY` | 앱 서명 (CI) | Build only |

---

## 10. 개발 로드맵

### Phase 0 — Core Engine & Overlay (4주)
- [ ] Tauri 프로젝트 셋업 (macOS)
- [ ] 투명 always-on-top 윈도우 + Click-Through
- [ ] Catmull-Rom Spline 엔진 (Rust)
- [ ] React 오버레이 캔버스 연동 (IPC)
- [ ] Global Hotkey (`Shift+D`, `Shift+1~5`, `[`/`]`)

### Phase 1 — UX & License (3주)
- [ ] HUD UI (커서 추적)
- [ ] 설정 윈도우 (일반, 단축키, 보정)
- [ ] Supabase Auth 로그인
- [ ] License check API 연동 + 워터마크
- [ ] macOS 권한 온보딩

### Phase 2 — Polish & Windows (3주)
- [ ] Pro 캘리그라피 모드
- [ ] Undo, 다중 모니터
- [ ] Windows 포팅
- [ ] Auto-update (Tauri updater)
- [ ] Sentry 크래시 리포팅

---

## 11. 리스크 & Mitigation

| 리스크 | 영향 | 대응 |
|--------|------|------|
| macOS Screen Recording 권한 거부 | 오버레이 미표시 | 권한 가이드 UX, fallback 창 모드 |
| Global Hotkey OS 충돌 | 기능 불가 | 커스텀 단축키 + 충돌 감지 |
| Catmull-Rom 급격한 입력 시 오vershoot | 필기 품질 저하 | 속도 기반 tension 조절, max deviation clamp |
| 라이선스 서버 다운 | 유료 기능 차단 | 24h 오프라인 grace period |

---

## 12. Out of Scope (Desktop MVP)

- 판서 PDF/이미지 저장 (P2)
- 실시간 협업/공유
- 타블렛 펜 압력 입력 네이티브 지원
- Linux 지원
- 인앱 결제 (웹으로 redirect)

---

## 13. 부록: Tauri IPC 명세 (Draft)

```typescript
// Frontend → Rust
invoke('start_drawing_mode')
invoke('stop_drawing_mode')
invoke('toggle_click_through', { enabled: boolean })
invoke('append_stroke_point', { x, y, timestamp })
invoke('finalize_stroke')
invoke('undo_stroke')
invoke('set_pen', { color?, width? })
invoke('get_license_status')
invoke('refresh_license')

// Rust → Frontend (events)
listen('stroke_updated', { path: string })
listen('pen_changed', { color, width })
listen('license_updated', { plan_type, features })
listen('cursor_moved', { x, y })
```
