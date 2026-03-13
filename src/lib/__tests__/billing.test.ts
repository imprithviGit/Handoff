import { describe, it, expect } from "vitest";
import { computeTrialStatus, formatFileSize, fileTypeFromExtension } from "@/lib/utils/billing";

// ─── Trial / Access Status ────────────────────────────────────────────────────

describe("computeTrialStatus", () => {
  const NOW = new Date("2025-06-15T00:00:00Z");

  it("returns active for pro plan regardless of projects", () => {
    expect(computeTrialStatus("pro", null, NOW)).toEqual({ status: "active" });
    expect(computeTrialStatus("pro", "2020-01-01", NOW)).toEqual({ status: "active" });
  });

  it("returns active for lifetime plan", () => {
    expect(computeTrialStatus("lifetime", null, NOW)).toEqual({ status: "active" });
  });

  it("returns 14 day trial when no first project exists", () => {
    expect(computeTrialStatus("free", null, NOW)).toEqual({ status: "trial", daysLeft: 14 });
    expect(computeTrialStatus(null, null, NOW)).toEqual({ status: "trial", daysLeft: 14 });
  });

  it("returns trial with correct days left on day 0 (same day as first project)", () => {
    const result = computeTrialStatus("free", "2025-06-15T00:00:00Z", NOW);
    expect(result).toEqual({ status: "trial", daysLeft: 14 });
  });

  it("returns trial with correct days left mid-trial", () => {
    const result = computeTrialStatus("free", "2025-06-08T00:00:00Z", NOW); // 7 days ago
    expect(result).toEqual({ status: "trial", daysLeft: 7 });
  });

  it("returns trial with 1 day left on day 13", () => {
    const result = computeTrialStatus("free", "2025-06-02T00:00:00Z", NOW); // 13 days ago
    expect(result).toEqual({ status: "trial", daysLeft: 1 });
  });

  it("returns expired on day 14", () => {
    const result = computeTrialStatus("free", "2025-06-01T00:00:00Z", NOW); // 14 days ago
    expect(result).toEqual({ status: "expired" });
  });

  it("returns expired well past trial", () => {
    const result = computeTrialStatus("free", "2025-05-01T00:00:00Z", NOW); // 45 days ago
    expect(result).toEqual({ status: "expired" });
  });
});

// ─── File Size Formatting ─────────────────────────────────────────────────────

describe("formatFileSize", () => {
  it("formats bytes under 100KB as KB", () => {
    expect(formatFileSize(50 * 1024)).toBe("50 KB");
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("formats just above 100KB as MB", () => {
    // 0.1 MB = 104857.6 bytes; anything >= this flips to MB format
    const justOver = Math.ceil(0.1 * 1024 * 1024); // 104858 bytes = 0.100001... MB
    const result = formatFileSize(justOver);
    expect(result).toMatch(/MB$/);
  });

  it("formats larger files in MB", () => {
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10.0 MB");
  });

  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 KB");
  });
});

// ─── File Type Mapping ────────────────────────────────────────────────────────

describe("fileTypeFromExtension", () => {
  it("maps PDF correctly", () => {
    expect(fileTypeFromExtension("document.pdf")).toBe("pdf");
  });

  it("maps image extensions", () => {
    expect(fileTypeFromExtension("photo.png")).toBe("image");
    expect(fileTypeFromExtension("photo.jpg")).toBe("image");
    expect(fileTypeFromExtension("photo.jpeg")).toBe("image");
    expect(fileTypeFromExtension("photo.webp")).toBe("image");
    expect(fileTypeFromExtension("icon.svg")).toBe("image");
    expect(fileTypeFromExtension("anim.gif")).toBe("image");
  });

  it("maps Figma files", () => {
    expect(fileTypeFromExtension("design.fig")).toBe("figma");
    expect(fileTypeFromExtension("design.figma")).toBe("figma");
  });

  it("maps Office documents", () => {
    expect(fileTypeFromExtension("report.doc")).toBe("doc");
    expect(fileTypeFromExtension("report.docx")).toBe("doc");
    expect(fileTypeFromExtension("data.xls")).toBe("sheet");
    expect(fileTypeFromExtension("data.xlsx")).toBe("sheet");
    expect(fileTypeFromExtension("export.csv")).toBe("sheet");
  });

  it("maps zip files", () => {
    expect(fileTypeFromExtension("archive.zip")).toBe("zip");
  });

  it("returns default for unknown extensions", () => {
    expect(fileTypeFromExtension("notes.txt")).toBe("default");
    expect(fileTypeFromExtension("binary.bin")).toBe("default");
  });

  it("handles uppercase extensions (case-insensitive)", () => {
    expect(fileTypeFromExtension("PHOTO.PNG")).toBe("image");
    expect(fileTypeFromExtension("DOC.PDF")).toBe("pdf");
  });

  it("handles files with no extension", () => {
    expect(fileTypeFromExtension("Makefile")).toBe("default");
  });
});
