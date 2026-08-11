"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "홈", icon: "🏠" },
  { href: "/dashboard/billing", label: "구독", icon: "💳" },
  { href: "/dashboard/organization", label: "조직", icon: "🏢" },
  { href: "/dashboard/settings", label: "설정", icon: "⚙️" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-navy text-white">
      <div className="border-b border-slate-700 p-4">
        <Link href="/" className="text-lg font-bold">
          SmoothPoint
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-brand" : "hover:bg-navy-light"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
