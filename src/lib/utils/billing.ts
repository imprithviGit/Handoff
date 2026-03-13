import type { AccessStatus, Plan } from "@/lib/actions/billing";

/**
 * Pure logic for computing trial/access status — testable without DB/Clerk deps.
 */
export function computeTrialStatus(
  plan: Plan | null,
  firstProjectCreatedAt: string | null,
  now = new Date()
): AccessStatus {
  if (plan === "pro" || plan === "lifetime") return { status: "active" };

  if (!firstProjectCreatedAt) return { status: "trial", daysLeft: 14 };

  const trialStart = new Date(firstProjectCreatedAt);
  const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft   = 14 - daysPassed;

  if (daysLeft > 0) return { status: "trial", daysLeft };
  return { status: "expired" };
}

/** Format a file size in bytes to a human-readable string. */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb < 0.1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(1)} MB`;
}

const FILE_TYPE_MAP: Record<string, string> = {
  pdf: "pdf", fig: "figma", figma: "figma",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image",
  doc: "doc", docx: "doc", xls: "sheet", xlsx: "sheet", csv: "sheet", zip: "zip",
};

/** Map a file extension to a display type label. */
export function fileTypeFromExtension(filename: string): string {
  const ext = (filename.split(".").pop() ?? "").toLowerCase();
  return FILE_TYPE_MAP[ext] ?? "default";
}
