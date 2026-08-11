"use client";

import { Button } from "@/components/ui/Button";

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  profiles?: { email: string; display_name: string | null } | null;
}

export function MemberTable({
  members,
  onRemove,
}: {
  members: Member[];
  onRemove: (id: string) => void;
}) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-slate-500">아직 멤버가 없습니다. 첫 강사를 초대하세요.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="pb-2">이름</th>
            <th className="pb-2">이메일</th>
            <th className="pb-2">역할</th>
            <th className="pb-2">가입일</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-slate-100">
              <td className="py-2">{m.profiles?.display_name ?? "-"}</td>
              <td className="py-2">{m.profiles?.email ?? "-"}</td>
              <td className="py-2 capitalize">{m.role}</td>
              <td className="py-2">
                {m.joined_at
                  ? new Date(m.joined_at).toLocaleDateString("ko-KR")
                  : "대기"}
              </td>
              <td className="py-2">
                {m.role !== "admin" && (
                  <Button
                    variant="ghost"
                    onClick={() => onRemove(m.id)}
                    className="text-red-600"
                  >
                    회수
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
