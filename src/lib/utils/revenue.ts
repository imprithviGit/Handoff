const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export interface MonthEntry {
  month: string;
  year: number;
  amount: number;
  projects: { name: string; client: string; amount: number }[];
}

export interface ProjectLike {
  amount: number | null;
  created_at: string;
  name: string;
  client_name?: string | null;
}

/** Returns the last N months as empty MonthEntry buckets, oldest first. */
export function buildMonthBuckets(n: number, now = new Date()): MonthEntry[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { month: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), amount: 0, projects: [] };
  });
}

/** Fills MonthEntry buckets with revenue from projects. */
export function fillMonthlyRevenue(buckets: MonthEntry[], projects: ProjectLike[]): MonthEntry[] {
  const result = buckets.map((b) => ({ ...b, projects: [] as MonthEntry["projects"] }));
  for (const p of projects) {
    if (!p.amount) continue;
    const created = new Date(p.created_at);
    const label = MONTH_LABELS[created.getMonth()];
    const year  = created.getFullYear();
    const entry = result.find((m) => m.month === label && m.year === year);
    if (entry) {
      entry.amount += Number(p.amount);
      entry.projects.push({ name: p.name, client: p.client_name ?? "—", amount: Number(p.amount) });
    }
  }
  return result;
}

/** Compute summary stats from filled monthly data. */
export function computeRevenueStats(
  monthlyData: MonthEntry[],
  target: number,
  currentMonthIndex: number
) {
  const current     = monthlyData[currentMonthIndex]?.amount ?? 0;
  const ytd         = monthlyData.reduce((s, m) => s + m.amount, 0);
  const nonZero     = monthlyData.filter((m) => m.amount > 0);
  const avgMonthly  = nonZero.length > 0 ? Math.round(ytd / nonZero.length) : 0;
  const bestMonth   = Math.max(...monthlyData.map((m) => m.amount), 0);
  const progress    = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const remaining   = Math.max(target - current, 0);
  return { current, ytd, avgMonthly, bestMonth, progress, remaining };
}
