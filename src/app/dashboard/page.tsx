"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/hooks/useProjects";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useAccess } from "@/lib/hooks/useAccess";
import { createProject, updateProject } from "@/lib/actions/projects";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PaywallOverlay, HardPaywall } from "@/components/Paywall";

// Generate last 7 months labels ending at current month
function getLast7Months() {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return { month: months[d.getMonth()], year: d.getFullYear(), amount: 0 };
  });
}

type Status = "Ready to work" | "In Progress" | "Under Review" | "Completed" | "Parked";

const ALL_STATUSES: Status[] = ["Ready to work", "In Progress", "Under Review", "Completed", "Parked"];

const statusConfig: Record<Status, { dot: string; text: string; bg: string; border: string }> = {
  "Ready to work": { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200"  },
  "In Progress":   { dot: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200"    },
  "Under Review":  { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  "Completed":     { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  "Parked":        { dot: "bg-gray-400",    text: "text-gray-500",    bg: "bg-gray-100",   border: "border-gray-200"    },
};

// ── Status dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  status,
  onChange,
}: {
  status: Status;
  onChange: (s: Status) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const s = statusConfig[status];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className={`cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${s.bg} ${s.text} ${s.border} hover:brightness-95`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {status}
        <svg className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-gray-150 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] py-1.5 min-w-[160px]">
          {ALL_STATUSES.map((opt) => {
            const cfg = statusConfig[opt];
            const active = opt === status;
            return (
              <button
                key={opt}
                onClick={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
                className={`cursor-pointer w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-left transition-colors ${
                  active ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                {opt}
                {active && (
                  <svg className="ml-auto w-3.5 h-3.5 text-gray-400" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

async function startCheckout(plan: string) {
  const res = await fetch("/api/dodo/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function DashboardPage() {
  const { projects: dbProjects, loading, refetch } = useProjects();
  const { unread } = useNotifications(dbProjects.map((p) => p.id));
  const { isExpired, isTrial, daysLeft } = useAccess();
  const [showPaywallOverlay, setShowPaywallOverlay] = useState(false);
  const [showHardPaywall, setShowHardPaywall]       = useState(false);

  // Show soft paywall overlay on first open when expired
  useEffect(() => {
    if (isExpired) setShowPaywallOverlay(true);
  }, [isExpired]);

  function requireAccess(): boolean {
    if (isExpired) { setShowHardPaywall(true); return false; }
    return true;
  }
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});
  const projects = dbProjects.map((p) => ({
    ...p,
    status: (statusOverrides[p.id] ?? p.status) as Status,
    client: p.client_name ?? "",
    deadline: p.deadline ? new Date(p.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
    pendingApprovals: 0,
    filesCount: 0,
    lastUpdated: new Date(p.updated_at).toLocaleDateString(),
    token: p.share_token,
  }));

  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", client: "", deadline: "", amount: "", notes: "", isContract: false });
  const [creating, setCreating]   = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [target, setTarget] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("handoff_revenue_target");
    if (saved) setTarget(Number(saved));
  }, []);

  // Compute real stats from projects
  const activeProjects   = projects.filter((p) => p.status !== "Completed" && p.status !== "Parked").length;
  const pendingApprovals = projects.reduce((sum, p) => sum + p.pendingApprovals, 0);
  const totalClients     = new Set(projects.map((p) => p.client).filter(Boolean)).size;

  const stats = [
    { label: "Active projects",   value: String(activeProjects),   sub: activeProjects === 1 ? "1 project running" : `${activeProjects} projects running`, accent: false },
    { label: "Pending approvals", value: String(pendingApprovals), sub: pendingApprovals > 0 ? "Needs attention" : "All clear",                            accent: pendingApprovals > 0 },
    { label: "Total clients",     value: String(totalClients),     sub: "Across all projects",                                                             accent: false },
    { label: "Total projects",    value: String(projects.length),  sub: "All time",                                                                        accent: false },
  ];

  // Build monthly earnings from real project amounts (by created_at month)
  const monthlyEarnings = getLast7Months();
  projects.forEach((p) => {
    if (!p.amount) return;
    const created = new Date(p.created_at);
    const label = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][created.getMonth()];
    const year  = created.getFullYear();
    const entry = monthlyEarnings.find((m) => m.month === label && m.year === year);
    if (entry) entry.amount += Number(p.amount);
  });

  const thisMonth      = monthlyEarnings[monthlyEarnings.length - 1].amount;
  const lastMonth      = monthlyEarnings[monthlyEarnings.length - 2].amount;
  const growth         = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null;
  const targetProgress = target > 0 ? Math.min((thisMonth / target) * 100, 100) : 0;
  const targetRemaining = target > 0 ? Math.max(target - thisMonth, 0) : 0;

  function copyLink(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    navigator.clipboard.writeText(`${window.location.origin}/p/${project.share_token}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreateProject() {
    if (!newProject.name.trim()) return;
    setCreating(true);
    await createProject({
      name: newProject.name,
      client_name: newProject.client || undefined,
      deadline: newProject.isContract ? undefined : (newProject.deadline || undefined),
      amount: newProject.amount ? Number(newProject.amount) : undefined,
      description: newProject.notes || undefined,
      is_contract: newProject.isContract,
    });
    await refetch();
    setCreating(false);
    setNewProject({ name: "", client: "", deadline: "", amount: "", notes: "", isContract: false });
    setShowModal(false);
  }

  async function updateStatus(id: string, status: Status) {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
    await updateProject(id, { status });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
      {showPaywallOverlay && <PaywallOverlay onDismiss={() => setShowPaywallOverlay(false)} />}
      {showHardPaywall    && <HardPaywall    onClose={() => setShowHardPaywall(false)} />}

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_1px_0_0_#f1f5f9]">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your active client work</p>
        </div>
        <div className="flex items-center gap-3">
          {(isTrial || isExpired) && (
            <button
              onClick={() => setShowPaywallOverlay(true)}
              className="cursor-pointer text-[12px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-lg transition-colors"
            >
              Upgrade to Pro →
            </button>
          )}
          <button
            onClick={() => { if (requireAccess()) setShowModal(true); }}
            className="cursor-pointer flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span> New project
          </button>
        </div>
      </div>

      <div className="px-8 py-7 max-w-7xl mx-auto">

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-5 py-4">
              <p className={`text-[32px] font-bold tracking-tight tabular-nums leading-none ${s.accent ? "text-amber-500" : "text-gray-900"}`}>
                {s.value}
              </p>
              <p className="text-[13px] font-medium text-gray-700 mt-2">{s.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Revenue strip ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-5 py-3.5 mb-5 flex items-center gap-6">
          <div className="shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">This month</p>
            <p className="text-[20px] font-bold text-gray-900 tabular-nums leading-none">
              ${thisMonth.toLocaleString()}
              {growth !== null && (
                <span className={`ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${Number(growth) >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                  {Number(growth) >= 0 ? "↑" : "↓"}{Math.abs(Number(growth))}%
                </span>
              )}
            </p>
          </div>

          <div className="w-px h-8 bg-gray-100 shrink-0" />

          <div
            className="flex-1 min-w-0 transition-all duration-200"
            style={{ height: "40px" }}
            onMouseEnter={(e) => (e.currentTarget.style.height = "64px")}
            onMouseLeave={(e) => (e.currentTarget.style.height = "40px")}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEarnings} barSize={14} barCategoryGap="30%" margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#cbd5e1" }} />
                <YAxis hide />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-gray-900 text-white text-[11px] font-semibold px-2 py-1 rounded-lg shadow-lg">
                        ${payload[0].value?.toLocaleString()}
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                  {monthlyEarnings.map((_, i) => (
                    <Cell key={i} fill={i === monthlyEarnings.length - 1 ? "#10b981" : "#e2e8f0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-px h-8 bg-gray-100 shrink-0" />

          {target > 0 ? (
            <div className="shrink-0 w-40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Target</span>
                <span className="text-[10px] font-semibold text-gray-500">{targetProgress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${targetProgress}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">${targetRemaining.toLocaleString()} left</span>
                <Link href="/dashboard/revenue" className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-500">Edit →</Link>
              </div>
            </div>
          ) : (
            <Link href="/dashboard/revenue" className="shrink-0 text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              + Set monthly target →
            </Link>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-44 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-[14px] font-semibold text-gray-700 mb-1">No projects yet</p>
            <p className="text-[13px] text-gray-400 mb-4">Create your first project and share a link with your client.</p>
            <button onClick={() => setShowModal(true)} className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors">
              + New project
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && (() => {
          const notified = projects.filter((p) => unread[p.id]?.messages || unread[p.id]?.approvals);
          const rest     = projects.filter((p) => !unread[p.id]?.messages && !unread[p.id]?.approvals);

          const ProjectCard = ({ p, highlight }: { p: typeof projects[0]; highlight?: boolean }) => (
            <div key={p.id} className={`rounded-xl border shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col ${
              highlight
                ? "bg-amber-50 border-amber-200 hover:border-amber-300"
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Link href={`/dashboard/project/${p.id}`} className="flex-1 min-w-0 block cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-gray-900 leading-snug truncate group-hover:text-emerald-600 transition-colors">{p.name}</p>
                      {p.is_contract && (
                        <span className="shrink-0 text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">Long-term</span>
                      )}
                      {highlight && (
                        <span className="shrink-0 text-amber-500" title="New client activity" style={{ animation: "bell-ring 1.5s ease-in-out infinite", display: "inline-flex" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-gray-400">{p.client}</p>
                      {highlight && (
                        <div className="flex items-center gap-1">
                          {unread[p.id]?.messages  && <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">New message</span>}
                          {unread[p.id]?.approvals && <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">Approval update</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                  <StatusDropdown status={p.status} onChange={(s) => updateStatus(p.id, s)} />
                </div>

                <Link href={`/dashboard/project/${p.id}`} className="block cursor-pointer mb-4">
                  <p className="text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                    {p.amount ? `$${p.amount.toLocaleString()}` : "—"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{p.is_contract ? "Monthly rate" : "Project value"}</p>
                </Link>

                <Link href={`/dashboard/project/${p.id}`} className="block cursor-pointer">
                  <div className={`flex items-center gap-4 pt-3.5 border-t ${highlight ? "border-amber-200" : "border-gray-100"}`}>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{p.filesCount}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Files</p>
                    </div>
                    <div className={`w-px h-5 ${highlight ? "bg-amber-200" : "bg-gray-100"}`} />
                    <div>
                      <p className={`text-[13px] font-semibold ${p.pendingApprovals > 0 ? "text-amber-500" : "text-gray-800"}`}>
                        {p.pendingApprovals}
                        {p.pendingApprovals > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 mb-0.5" />}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Approvals</p>
                    </div>
                    <div className={`w-px h-5 ${highlight ? "bg-amber-200" : "bg-gray-100"}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">{p.is_contract ? "Ongoing" : p.deadline}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Deadline</p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className={`px-5 py-3 border-t flex items-center justify-between ${highlight ? "border-amber-200" : "border-gray-100"}`}>
                <p className="text-[11px] text-gray-400">Updated {p.lastUpdated}</p>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/project/${p.id}`} className="cursor-pointer text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-all">
                    Open
                  </Link>
                  <button
                    onClick={() => copyLink(p.id)}
                    className={`cursor-pointer text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${copied === p.id ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black"}`}
                  >
                    {copied === p.id ? "Copied ✓" : "Copy link"}
                  </button>
                </div>
              </div>
            </div>
          );

          return (
            <>
              {/* ── Needs attention ──────────────────────────────────────── */}
              {notified.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-500" style={{ animation: "bell-ring 2s ease-in-out infinite", display: "inline-flex" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </span>
                    <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest">Needs attention</p>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">{notified.length}</span>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {notified.map((p) => <ProjectCard key={p.id} p={p} highlight />)}
                  </div>
                </div>
              )}

              {/* ── All projects ─────────────────────────────────────────── */}
              {rest.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">All projects</p>
                    <p className="text-[11px] text-gray-400">{projects.length} total</p>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {rest.map((p) => <ProjectCard key={p.id} p={p} />)}
                  </div>
                </>
              )}

              {/* Edge case: all projects have notifications, still show the count */}
              {rest.length === 0 && notified.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1">{projects.length} total project{projects.length !== 1 ? "s" : ""}</p>
              )}
            </>
          );
        })()}

      </div>

      {/* ── New Project Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">New project</h2>
                <p className="text-xs text-gray-400 mt-0.5">A client portal link is created automatically</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-xs mt-0.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Project name</label>
                <input
                  type="text"
                  placeholder="e.g. Brand Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Client name</label>
                <input
                  type="text"
                  placeholder="e.g. Riya Kapoor"
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                />
              </div>

              {/* Contract toggle */}
              <button
                type="button"
                onClick={() => setNewProject({ ...newProject, isContract: !newProject.isContract, deadline: "" })}
                className="cursor-pointer w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">Long-term / contract</p>
                  <p className="text-[11px] text-gray-400">6 months, yearly retainer, ongoing work</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors shrink-0 ${newProject.isContract ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow mt-[3px] transition-transform ${newProject.isContract ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                {!newProject.isContract && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Deadline</label>
                    <input
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                    />
                  </div>
                )}
                <div className={newProject.isContract ? "col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Value (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      placeholder={newProject.isContract ? "Monthly rate" : "1200"}
                      value={newProject.amount}
                      onChange={(e) => setNewProject({ ...newProject, amount: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea
                  placeholder="e.g. Full brand identity redesign including logo, color palette…"
                  value={newProject.notes}
                  onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creating || !newProject.name.trim()}
                className="cursor-pointer flex-1 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {creating ? "Creating…" : "Create project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
