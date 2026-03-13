import { describe, it, expect } from "vitest";

/**
 * Tests for notification unread logic.
 * The useNotifications hook determines whether a project has unread activity
 * by comparing the latest row's timestamp against a localStorage "last read" timestamp.
 */

function isUnread(latest: string | null, lastRead: string | null): boolean {
  if (!latest) return false;
  if (!lastRead) return true;
  return latest > lastRead;
}

describe("notification unread logic", () => {
  it("is unread when there is a latest item and no lastRead timestamp", () => {
    expect(isUnread("2025-06-15T10:00:00Z", null)).toBe(true);
  });

  it("is not unread when there is no latest item", () => {
    expect(isUnread(null, null)).toBe(false);
    expect(isUnread(null, "2025-06-14T10:00:00Z")).toBe(false);
  });

  it("is unread when latest is after lastRead", () => {
    expect(isUnread("2025-06-15T10:00:00Z", "2025-06-14T10:00:00Z")).toBe(true);
  });

  it("is not unread when latest equals lastRead", () => {
    expect(isUnread("2025-06-15T10:00:00Z", "2025-06-15T10:00:00Z")).toBe(false);
  });

  it("is not unread when latest is before lastRead", () => {
    expect(isUnread("2025-06-14T10:00:00Z", "2025-06-15T10:00:00Z")).toBe(false);
  });
});

// ─── Approval filter logic ────────────────────────────────────────────────────

describe("approval notification filter", () => {
  type Approval = { project_id: string; status: string; updated_at: string };

  /** Simulates what useNotifications does: fetch only pending approvals */
  function getPendingApprovals(approvals: Approval[], projectIds: string[]): Approval[] {
    return approvals
      .filter((a) => a.status === "pending")
      .filter((a) => projectIds.includes(a.project_id));
  }

  it("includes pending approvals", () => {
    const approvals: Approval[] = [
      { project_id: "p1", status: "pending", updated_at: "2025-06-15T10:00:00Z" },
    ];
    const result = getPendingApprovals(approvals, ["p1"]);
    expect(result).toHaveLength(1);
  });

  it("excludes approved approvals from notification query", () => {
    const approvals: Approval[] = [
      { project_id: "p1", status: "approved", updated_at: "2025-06-15T10:00:00Z" },
    ];
    const result = getPendingApprovals(approvals, ["p1"]);
    expect(result).toHaveLength(0);
  });

  it("excludes changes_requested from notification query", () => {
    const approvals: Approval[] = [
      { project_id: "p1", status: "changes_requested", updated_at: "2025-06-15T10:00:00Z" },
    ];
    const result = getPendingApprovals(approvals, ["p1"]);
    expect(result).toHaveLength(0);
  });

  it("only includes approvals from the given project IDs", () => {
    const approvals: Approval[] = [
      { project_id: "p1", status: "pending", updated_at: "2025-06-15T10:00:00Z" },
      { project_id: "p2", status: "pending", updated_at: "2025-06-15T10:00:00Z" },
    ];
    const result = getPendingApprovals(approvals, ["p1"]);
    expect(result).toHaveLength(1);
    expect(result[0].project_id).toBe("p1");
  });
});
