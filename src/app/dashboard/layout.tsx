"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

// ── icons ─────────────────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/>
    </svg>
  );
}

function IconCash() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="8.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 6.5v4M12 6.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.36 3.64l-1.06 1.06M4.7 11.3l-1.06 1.06M12.36 12.36l-1.06-1.06M4.7 4.7 3.64 3.64" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ── nav item ──────────────────────────────────────────────────────────────────

function NavItem({ href, icon, label, expanded, active }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg font-medium text-[13px] cursor-pointer transition-colors ${
        active
          ? "bg-gray-900 text-white"
          : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      {icon}
      <span className={`whitespace-nowrap transition-all duration-150 ${expanded ? "opacity-100 delay-75" : "opacity-0 w-0 overflow-hidden"}`}>
        {label}
      </span>
    </Link>
  );
}

// ── layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const userName    = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "Account";
  const userEmail   = user?.emailAddresses[0]?.emailAddress ?? "";
  const userInitial = userName[0]?.toUpperCase() ?? "A";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`bg-white border-r border-gray-100 flex flex-col fixed h-full z-20 shadow-[1px_0_0_0_#f1f5f9] transition-all duration-200 ease-out overflow-hidden ${
          expanded ? "w-52" : "w-14"
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center border-b border-gray-100 px-3.5">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer min-w-0">
            <span
              className={`text-[16px] font-extrabold tracking-tight text-gray-900 whitespace-nowrap transition-all duration-150 ${expanded ? "opacity-100 delay-75" : "opacity-0 w-0"}`}
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Hand<span className="text-emerald-500">off</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <NavItem href="/dashboard"         icon={<IconGrid />}     label="Projects" expanded={expanded} active={pathname === "/dashboard"} />
          <NavItem href="/dashboard/revenue" icon={<IconCash />}     label="Revenue"  expanded={expanded} active={pathname === "/dashboard/revenue"} />
          <NavItem href="/dashboard/settings" icon={<IconSettings />} label="Settings" expanded={expanded} active={pathname === "/dashboard/settings"} />
        </nav>

        {/* User */}
        <div className="px-2 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
              {userInitial}
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-150 ${expanded ? "opacity-100 delay-75" : "opacity-0 w-0 overflow-hidden"}`}>
              <p className="text-[12px] font-semibold text-gray-900 whitespace-nowrap leading-tight">{userName}</p>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">{userEmail}</p>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className={`cursor-pointer text-[10px] text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap ${expanded ? "opacity-100 delay-75" : "opacity-0 w-0 overflow-hidden"}`}
              title="Sign out"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-14 min-h-screen">
        {children}
      </main>
    </div>
  );
}
