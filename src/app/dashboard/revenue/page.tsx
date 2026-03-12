"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { useProjects } from "@/lib/hooks/useProjects";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getLast7Months() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return { month: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), amount: 0, projects: [] as { name: string; client: string; amount: number }[] };
  });
}

export default function RevenuePage() {
  const { projects, loading } = useProjects();
  const [target, setTarget]         = useState<number>(0);
  const [targetInput, setTargetInput] = useState<string>("0");
  const [editing, setEditing]       = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(6); // last month by default

  useEffect(() => {
    const saved = localStorage.getItem("handoff_revenue_target");
    if (saved) { setTarget(Number(saved)); setTargetInput(saved); }
  }, []);

  function saveTarget() {
    const val = Math.max(0, Number(targetInput) || 0);
    setTarget(val);
    setTargetInput(String(val));
    localStorage.setItem("handoff_revenue_target", String(val));
    setEditing(false);
  }

  // Build monthly data from real projects
  const monthlyData = getLast7Months();
  projects.forEach((p) => {
    if (!p.amount) return;
    const created = new Date(p.created_at);
    const label = MONTH_LABELS[created.getMonth()];
    const year  = created.getFullYear();
    const entry = monthlyData.find((m) => m.month === label && m.year === year);
    if (entry) {
      entry.amount += Number(p.amount);
      entry.projects.push({ name: p.name, client: p.client_name ?? "—", amount: Number(p.amount) });
    }
  });

  const currentMonthIndex = 6;
  const current   = monthlyData[currentMonthIndex].amount;
  const ytd       = monthlyData.reduce((s, m) => s + m.amount, 0);
  const nonZero   = monthlyData.filter((m) => m.amount > 0);
  const avgMonthly = nonZero.length > 0 ? Math.round(ytd / nonZero.length) : 0;
  const bestMonth  = Math.max(...monthlyData.map((m) => m.amount), 0);
  const progress   = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining  = Math.max(target - current, 0);
  const selected   = monthlyData[selectedMonth];

  const now = new Date();
  const thisMonthLabel = `${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`;
  const rangeLabel = `${monthlyData[0].month} ${monthlyData[0].year} – ${monthlyData[6].month} ${monthlyData[6].year}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight">Revenue</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track earnings and set your monthly target</p>
        </div>
      </div>

      <div className="px-8 py-7 max-w-5xl mx-auto space-y-5">

        {/* ── KPI row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "This month",   value: `$${current.toLocaleString()}`,     sub: thisMonthLabel },
            { label: "Year to date", value: `$${ytd.toLocaleString()}`,         sub: rangeLabel },
            { label: "Monthly avg",  value: `$${avgMonthly.toLocaleString()}`,  sub: bestMonth > 0 ? `Best: $${bestMonth.toLocaleString()}` : "No data yet" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-6 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{k.label}</p>
              <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">{k.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Monthly target ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-start justify-between gap-6 mb-5">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Monthly target</p>
              {editing ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      autoFocus
                      type="number"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveTarget()}
                      className="border border-gray-200 rounded-lg pl-7 pr-4 py-2 text-[22px] font-bold text-gray-900 w-40 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 tabular-nums"
                    />
                  </div>
                  <button onClick={saveTarget} className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors">
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="cursor-pointer text-[12px] font-medium text-gray-400 hover:text-gray-700 px-2 py-2">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[28px] font-bold text-gray-900 tabular-nums">
                    {target > 0 ? `$${target.toLocaleString()}` : "—"}
                    {target > 0 && <span className="text-[14px] text-gray-400 font-medium">/mo</span>}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="cursor-pointer text-[11px] font-semibold text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-2.5 py-1 rounded-lg transition-all"
                  >
                    {target > 0 ? "Edit" : "Set target"}
                  </button>
                </div>
              )}
            </div>

            {target > 0 && (
              <div className="text-right shrink-0">
                {progress >= 100 ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    🎯 Target hit!
                  </span>
                ) : (
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Still needed</p>
                    <p className="text-[20px] font-bold text-gray-900 tabular-nums">${remaining.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {target > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>${current.toLocaleString()} earned</span>
                <span>{progress.toFixed(0)}% of goal</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? "bg-emerald-500" : "bg-emerald-400"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>$0</span>
                <span>${target.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Chart ──────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Monthly overview</p>
            <p className="text-[11px] text-gray-400">Click a bar to see breakdown</p>
          </div>

          {loading ? (
            <div className="h-40 animate-pulse bg-gray-100 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={monthlyData}
                barSize={28}
                barCategoryGap="30%"
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                onClick={(data) => { if (data?.activeTooltipIndex !== undefined) setSelectedMonth(data.activeTooltipIndex); }}
              >
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis hide />
                {target > 0 && (
                  <ReferenceLine
                    y={target}
                    stroke="#10b981"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{ value: "Target", position: "insideTopRight", fontSize: 10, fill: "#10b981", dy: -4 }}
                  />
                )}
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)", radius: 4 }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg">
                        ${payload[0].value?.toLocaleString()}
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="amount" radius={[5, 5, 0, 0]} style={{ cursor: "pointer" }}>
                  {monthlyData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === selectedMonth ? "#10b981" : i === currentMonthIndex ? "#6ee7b7" : "#e2e8f0"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Selected month breakdown ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              {selected.month} breakdown
            </p>
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">${selected.amount.toLocaleString()}</p>
          </div>

          {selected.projects.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[13px] text-gray-400">No projects in {selected.month}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selected.projects.map((p, i) => {
                const pct = selected.amount > 0 ? Math.round((p.amount / selected.amount) * 100) : 0;
                return (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">{p.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{p.client}</p>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[13px] font-bold text-gray-900 tabular-nums w-16 text-right">${p.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 w-8 text-right">{pct}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
