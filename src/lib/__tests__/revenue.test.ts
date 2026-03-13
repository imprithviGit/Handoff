import { describe, it, expect } from "vitest";
import { buildMonthBuckets, fillMonthlyRevenue, computeRevenueStats } from "@/lib/utils/revenue";

// ─── buildMonthBuckets ────────────────────────────────────────────────────────

describe("buildMonthBuckets", () => {
  const NOW = new Date("2025-06-15T00:00:00Z");

  it("returns the correct number of buckets", () => {
    expect(buildMonthBuckets(7, NOW)).toHaveLength(7);
  });

  it("last bucket is current month", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const last = buckets[buckets.length - 1];
    expect(last.month).toBe("Jun");
    expect(last.year).toBe(2025);
  });

  it("first bucket is 6 months ago for 7-bucket window", () => {
    const buckets = buildMonthBuckets(7, NOW);
    expect(buckets[0].month).toBe("Dec");
    expect(buckets[0].year).toBe(2024);
  });

  it("all buckets start with zero amount and empty projects", () => {
    const buckets = buildMonthBuckets(3, NOW);
    for (const b of buckets) {
      expect(b.amount).toBe(0);
      expect(b.projects).toHaveLength(0);
    }
  });

  it("handles year rollover correctly", () => {
    const jan2025 = new Date("2025-01-15T00:00:00Z");
    const buckets = buildMonthBuckets(3, jan2025);
    expect(buckets[0]).toMatchObject({ month: "Nov", year: 2024 });
    expect(buckets[1]).toMatchObject({ month: "Dec", year: 2024 });
    expect(buckets[2]).toMatchObject({ month: "Jan", year: 2025 });
  });
});

// ─── fillMonthlyRevenue ───────────────────────────────────────────────────────

describe("fillMonthlyRevenue", () => {
  const NOW = new Date("2025-06-15T00:00:00Z");

  it("adds project amount to the correct month bucket", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const projects = [
      { amount: 500, created_at: "2025-06-01T10:00:00Z", name: "Project A", client_name: "Alice" },
    ];
    const result = fillMonthlyRevenue(buckets, projects);
    const june = result.find((b) => b.month === "Jun" && b.year === 2025)!;
    expect(june.amount).toBe(500);
    expect(june.projects).toHaveLength(1);
    expect(june.projects[0]).toEqual({ name: "Project A", client: "Alice", amount: 500 });
  });

  it("sums multiple projects in the same month", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const projects = [
      { amount: 300, created_at: "2025-06-01T00:00:00Z", name: "P1", client_name: "Alice" },
      { amount: 700, created_at: "2025-06-20T00:00:00Z", name: "P2", client_name: "Bob" },
    ];
    const result = fillMonthlyRevenue(buckets, projects);
    const june = result.find((b) => b.month === "Jun" && b.year === 2025)!;
    expect(june.amount).toBe(1000);
    expect(june.projects).toHaveLength(2);
  });

  it("ignores projects outside the bucket window", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const projects = [
      { amount: 1000, created_at: "2020-01-01T00:00:00Z", name: "Old", client_name: null },
    ];
    const result = fillMonthlyRevenue(buckets, projects);
    expect(result.every((b) => b.amount === 0)).toBe(true);
  });

  it("ignores projects with null or zero amount", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const projects = [
      { amount: null, created_at: "2025-06-01T00:00:00Z", name: "Free project", client_name: null },
      { amount: 0, created_at: "2025-06-01T00:00:00Z", name: "Zero project", client_name: null },
    ];
    const result = fillMonthlyRevenue(buckets, projects as never);
    expect(result.every((b) => b.amount === 0)).toBe(true);
  });

  it("uses '—' when client_name is null", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const projects = [
      { amount: 200, created_at: "2025-06-01T00:00:00Z", name: "P", client_name: null },
    ];
    const result = fillMonthlyRevenue(buckets, projects);
    const june = result.find((b) => b.month === "Jun" && b.year === 2025)!;
    expect(june.projects[0].client).toBe("—");
  });

  it("does not mutate the original buckets", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const projects = [
      { amount: 500, created_at: "2025-06-01T00:00:00Z", name: "P", client_name: "X" },
    ];
    fillMonthlyRevenue(buckets, projects);
    // original buckets should be unchanged
    const june = buckets.find((b) => b.month === "Jun" && b.year === 2025)!;
    expect(june.amount).toBe(0);
  });
});

// ─── computeRevenueStats ──────────────────────────────────────────────────────

describe("computeRevenueStats", () => {
  const NOW = new Date("2025-06-15T00:00:00Z");

  function makeData() {
    const buckets = buildMonthBuckets(7, NOW);
    return fillMonthlyRevenue(buckets, [
      { amount: 500, created_at: "2025-06-01T00:00:00Z", name: "P1", client_name: null },
      { amount: 300, created_at: "2025-05-01T00:00:00Z", name: "P2", client_name: null },
      { amount: 200, created_at: "2025-04-01T00:00:00Z", name: "P3", client_name: null },
    ]);
  }

  it("computes current month correctly (index 6 = current)", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 0, 6);
    expect(stats.current).toBe(500);
  });

  it("computes year-to-date total", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 0, 6);
    expect(stats.ytd).toBe(1000);
  });

  it("computes average only from non-zero months", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 0, 6);
    // 3 months with revenue: 500, 300, 200 → avg = 1000/3 ≈ 333
    expect(stats.avgMonthly).toBe(333);
  });

  it("computes best month", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 0, 6);
    expect(stats.bestMonth).toBe(500);
  });

  it("progress is 0 when target is 0", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 0, 6);
    expect(stats.progress).toBe(0);
  });

  it("progress is capped at 100 when target exceeded", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 100, 6); // target $100, earned $500
    expect(stats.progress).toBe(100);
  });

  it("computes progress correctly below target", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 1000, 6); // target $1000, earned $500
    expect(stats.progress).toBe(50);
  });

  it("remaining is 0 when target exceeded", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 100, 6);
    expect(stats.remaining).toBe(0);
  });

  it("remaining is correct when under target", () => {
    const data = makeData();
    const stats = computeRevenueStats(data, 800, 6); // target $800, earned $500
    expect(stats.remaining).toBe(300);
  });

  it("returns zeros for all-empty months", () => {
    const buckets = buildMonthBuckets(7, NOW);
    const stats = computeRevenueStats(buckets, 500, 6);
    expect(stats.current).toBe(0);
    expect(stats.ytd).toBe(0);
    expect(stats.avgMonthly).toBe(0);
    expect(stats.bestMonth).toBe(0);
    expect(stats.progress).toBe(0);
    expect(stats.remaining).toBe(500);
  });
});
