"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MemberTable } from "@/components/org/MemberTable";
import { LogoUpload } from "@/components/org/LogoUpload";

interface OrgData {
  organization: {
    id: string;
    name: string;
    logo_url: string | null;
    seat_limit: number;
  } | null;
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    joined_at: string | null;
    profiles?: { email: string; display_name: string | null } | null;
  }>;
  role: string | null;
}

export default function OrganizationPage() {
  const [data, setData] = useState<OrgData | null>(null);
  const [orgName, setOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadOrg() {
    fetch("/api/v1/org")
      .then((r) => r.json())
      .then(setData);
  }

  useEffect(() => {
    loadOrg();
  }, []);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/v1/org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: orgName }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setLoading(false);
      return;
    }

    loadOrg();
    setLoading(false);
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.organization) return;
    setLoading(true);

    const res = await fetch("/api/v1/org/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        organization_id: data.organization.id,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      alert(`초대 링크: ${result.signup_url}`);
      setInviteEmail("");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  async function removeMember(id: string) {
    if (!confirm("이 멤버의 라이선스를 회수하시겠습니까?")) return;
    await fetch(`/api/v1/org/members/${id}`, { method: "DELETE" });
    loadOrg();
  }

  if (!data) {
    return <p>로딩 중...</p>;
  }

  if (!data.organization) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold">조직 관리</h1>
        <Card title="Enterprise 조직 생성">
          <p className="mb-4 text-sm text-slate-600">
            Enterprise 플랜이 필요합니다. 조직을 생성하면 강사 라이선스와 로고
            워터마크를 관리할 수 있습니다.
          </p>
          <form onSubmit={createOrg} className="space-y-4">
            <Input
              label="조직 이름"
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              placeholder="OO학원"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              조직 생성
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const org = data.organization;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-navy">{org.name}</h1>

      {data.role === "admin" && (
        <>
          <Card title="조직 로고">
            <LogoUpload
              organizationId={org.id}
              currentUrl={org.logo_url}
              onUploaded={loadOrg}
            />
          </Card>

          <Card title="멤버 초대">
            <form onSubmit={inviteMember} className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="이메일"
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="instructor@example.com"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  초대
                </Button>
              </div>
            </form>
            <p className="mt-2 text-xs text-slate-500">
              좌석: {data.members.length} / {org.seat_limit}
            </p>
          </Card>
        </>
      )}

      <Card title="멤버 목록">
        <MemberTable members={data.members} onRemove={removeMember} />
      </Card>
    </div>
  );
}
