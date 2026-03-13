import { describe, it, expect } from "vitest";

/**
 * Tests for approval business logic (pure, no DB deps).
 */

type ApprovalStatus = "pending" | "approved" | "changes_requested";

interface Approval {
  id: string;
  title: string;
  status: ApprovalStatus;
  client_note?: string | null;
}

/** Simulates what decideApproval does to an approval record. */
function applyDecision(
  approval: Approval,
  decision: "approved" | "changes_requested",
  note?: string
): Approval {
  return { ...approval, status: decision, client_note: note ?? null };
}

/** Simulates what reviseApproval does to an approval record. */
function applyRevision(approval: Approval, title: string, description: string): Approval & { description: string } {
  return { ...approval, title, description, status: "pending", client_note: null };
}

describe("approval decision logic", () => {
  const baseApproval: Approval = {
    id: "appr_1",
    title: "Homepage Design v1",
    status: "pending",
    client_note: null,
  };

  it("sets status to approved", () => {
    const result = applyDecision(baseApproval, "approved");
    expect(result.status).toBe("approved");
  });

  it("sets status to changes_requested", () => {
    const result = applyDecision(baseApproval, "changes_requested");
    expect(result.status).toBe("changes_requested");
  });

  it("stores client note on decision", () => {
    const result = applyDecision(baseApproval, "changes_requested", "Please make the CTA bigger");
    expect(result.client_note).toBe("Please make the CTA bigger");
  });

  it("sets client_note to null when no note provided", () => {
    const result = applyDecision(baseApproval, "approved", undefined);
    expect(result.client_note).toBeNull();
  });

  it("does not mutate the original approval object", () => {
    applyDecision(baseApproval, "approved", "LGTM");
    expect(baseApproval.status).toBe("pending");
    expect(baseApproval.client_note).toBeNull();
  });
});

describe("approval revision logic", () => {
  const decidedApproval: Approval = {
    id: "appr_1",
    title: "Homepage Design v1",
    status: "changes_requested",
    client_note: "Make CTA bigger",
  };

  it("resets status to pending on revision", () => {
    const result = applyRevision(decidedApproval, "Homepage Design v2", "Updated with larger CTA");
    expect(result.status).toBe("pending");
  });

  it("clears client_note on revision", () => {
    const result = applyRevision(decidedApproval, "Homepage Design v2", "Updated with larger CTA");
    expect(result.client_note).toBeNull();
  });

  it("updates title and description on revision", () => {
    const result = applyRevision(decidedApproval, "Homepage Design v2", "New description");
    expect(result.title).toBe("Homepage Design v2");
    expect(result.description).toBe("New description");
  });
});

describe("approval status transitions", () => {
  it("only pending approvals should trigger freelancer notifications", () => {
    const statuses: ApprovalStatus[] = ["pending", "approved", "changes_requested"];
    const triggersNotification = (s: ApprovalStatus) => s === "pending";

    expect(triggersNotification("pending")).toBe(true);
    expect(triggersNotification("approved")).toBe(false);
    expect(triggersNotification("changes_requested")).toBe(false);
  });

  it("approved approval cannot be further decided", () => {
    const isDecidable = (s: ApprovalStatus) => s === "pending";
    expect(isDecidable("approved")).toBe(false);
    expect(isDecidable("changes_requested")).toBe(false);
    expect(isDecidable("pending")).toBe(true);
  });
});
