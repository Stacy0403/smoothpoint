import { useState } from "react";
import type { LocalSettings } from "../../types";
import { useLicense } from "../../hooks/useLicense";
import { supabase, API_BASE } from "../../lib/supabase";

type Tab = "general" | "smoothing" | "account" | "about";

export function SettingsWindow({
  settings,
  onSettingsChange,
}: {
  settings: LocalSettings;
  onSettingsChange: (s: LocalSettings) => void;
}) {
  const [tab, setTab] = useState<Tab>("general");
  const { license, email, refreshLicense } = useLicense();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setAuthError("Supabase가 설정되지 않았습니다.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) setAuthError(error.message);
    else {
      setAuthError(null);
      await refreshLicense();
    }
  }

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    await refreshLicense();
  }

  function update(partial: Partial<LocalSettings>) {
    onSettingsChange({ ...settings, ...partial });
  }

  return (
    <div className="settings-window">
      <h1>SmoothPoint Settings</h1>

      <div className="settings-tabs">
        {(
          [
            ["general", "일반"],
            ["smoothing", "보정"],
            ["account", "계정"],
            ["about", "정보"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="settings-section">
          <div className="settings-row">
            <label>판서 종료 후 Click-Through 자동</label>
            <input
              type="checkbox"
              checked={settings.auto_click_through}
              onChange={(e) =>
                update({ auto_click_through: e.target.checked })
              }
            />
          </div>
          <div className="settings-row">
            <label>시작 시 트레이 최소화</label>
            <input
              type="checkbox"
              checked={settings.minimize_to_tray}
              onChange={(e) =>
                update({ minimize_to_tray: e.target.checked })
              }
            />
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
            단축키: Shift+D (판서), Shift+1~5 (색상), [ ] (두께), Shift+Z
            (Undo), Shift+Esc (Click-Through)
          </p>
        </div>
      )}

      {tab === "smoothing" && (
        <div className="settings-section">
          <div className="settings-row">
            <label>보정 강도</label>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.smoothing_strength}
              disabled={license?.plan_type === "free"}
              onChange={(e) =>
                update({ smoothing_strength: Number(e.target.value) })
              }
            />
            <span>{settings.smoothing_strength}</span>
          </div>
          <div className="settings-row">
            <label>캘리그라피 모드 (Pro+)</label>
            <input
              type="checkbox"
              checked={settings.calligraphy_mode}
              disabled={
                license?.plan_type !== "pro" &&
                license?.plan_type !== "enterprise"
              }
              onChange={(e) =>
                update({ calligraphy_mode: e.target.checked })
              }
            />
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="settings-section">
          {email ? (
            <>
              <p style={{ marginBottom: 8 }}>이메일: {email}</p>
              <p style={{ marginBottom: 8 }}>
                플랜: {license?.plan_type ?? "free"}
              </p>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="email"
                placeholder="이메일"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {authError && <p style={{ color: "red", fontSize: 12 }}>{authError}</p>}
              <button type="submit" className="btn">
                로그인
              </button>
            </form>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            onClick={() => {
              window.open(`${API_BASE}/dashboard`, "_blank");
            }}
          >
            웹 대시보드에서 관리
          </button>
        </div>
      )}

      {tab === "about" && (
        <div className="settings-section">
          <p>SmoothPoint v1.0.1</p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            Rust 기반 초저지연 AI 판서 보정
          </p>
        </div>
      )}
    </div>
  );
}
