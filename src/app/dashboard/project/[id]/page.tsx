"use client";

import { useState, use, useRef, useEffect } from "react";
import Link from "next/link";
import { useProjectDetail } from "@/lib/hooks/useProjects";
import { useMessages, useApprovals } from "@/lib/hooks/useProjectData";
import { postMessage } from "@/lib/actions/messages";
import { uploadFileDirect } from "@/lib/utils/uploadFile";
import { createApproval, reviseApproval } from "@/lib/actions/approvals";
import { deleteProject } from "@/lib/actions/projects";
import { useRouter } from "next/navigation";
import { markMessagesRead, markApprovalsRead } from "@/lib/hooks/useNotifications";
import { useAccess } from "@/lib/hooks/useAccess";
import { HardPaywall } from "@/components/Paywall";
import type { Message, Approval, FileAttachment } from "@/lib/supabase/types";

// ── types ─────────────────────────────────────────────────────────────────────

type ApprovalStatus = "pending" | "approved" | "changes_requested";

// ── config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { dot: string; text: string; bg: string }> = {
  "Ready to work": { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50"  },
  "In Progress":   { dot: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50"    },
  "Under Review":  { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"   },
  "Completed":     { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  "Parked":        { dot: "bg-gray-400",    text: "text-gray-500",    bg: "bg-gray-100"   },
};

const approvalStatusConfig: Record<ApprovalStatus, { label: string; text: string; bg: string; border: string }> = {
  pending:           { label: "Awaiting client",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  approved:          { label: "Approved",          text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  changes_requested: { label: "Changes requested", text: "text-red-600",     bg: "bg-red-50",     border: "border-red-200"     },
};

const fileIconMap: Record<string, { icon: string; bg: string; color: string }> = {
  pdf:    { icon: "PDF",  bg: "bg-red-50",     color: "text-red-500"     },
  figma:  { icon: "FIG",  bg: "bg-purple-50",  color: "text-purple-600"  },
  image:  { icon: "IMG",  bg: "bg-blue-50",    color: "text-blue-500"    },
  doc:    { icon: "DOC",  bg: "bg-sky-50",     color: "text-sky-600"     },
  sheet:  { icon: "XLS",  bg: "bg-emerald-50", color: "text-emerald-600" },
  zip:    { icon: "ZIP",  bg: "bg-gray-100",   color: "text-gray-500"    },
  default:{ icon: "FILE", bg: "bg-gray-100",   color: "text-gray-500"    },
};

// ── helpers ───────────────────────────────────────────────────────────────────

function fileSizeFromFile(f: File) {
  const mb = f.size / (1024 * 1024);
  return mb < 0.1 ? `${Math.round(f.size / 1024)} KB` : `${mb.toFixed(1)} MB`;
}

function extType(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["fig", "figma"].includes(ext)) return "figma";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (ext === "zip") return "zip";
  return "default";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function downloadFile(url: string, name: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function AttachmentList({ files }: { files: FileAttachment[] }) {
  if (!files.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2.5">
      {files.map((f, i) => {
        const icon = fileIconMap[f.type] ?? fileIconMap.default;
        return (
          <button
            key={i}
            onClick={() => downloadFile(f.url, f.name)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer ${icon.bg}`}
          >
            <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
            <span className="text-[11px] font-medium text-gray-700 max-w-[140px] truncate">{f.name}</span>
            <span className="text-[10px] text-gray-400">{f.size}</span>
          </button>
        );
      })}
    </div>
  );
}

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

function FilePickerButton({ onFiles, onError }: { onFiles: (f: File[]) => void; onError?: (msg: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" multiple className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          const oversized = selected.filter((f) => f.size > MAX_FILE_BYTES);
          const valid = selected.filter((f) => f.size <= MAX_FILE_BYTES);
          if (oversized.length > 0) {
            onError?.(`${oversized.map((f) => f.name).join(", ")} ${oversized.length === 1 ? "exceeds" : "exceed"} the ${MAX_FILE_MB} MB limit`);
          }
          if (valid.length > 0) onFiles(valid);
          e.target.value = "";
        }}
      />
      <button type="button" onClick={() => ref.current?.click()}
        className="cursor-pointer inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2M8 10V2M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Attach files
      </button>
    </>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { project, loading } = useProjectDetail(id);
  const { messages, loading: messagesLoading, refetch: refetchMessages, hasMore: hasMoreMessages, loadingMore: loadingMoreMessages, loadMore: loadMoreMessages } = useMessages(id);
  const { approvals, loading: approvalsLoading, refetch: refetchApprovals } = useApprovals(id);

  const { isExpired } = useAccess();
  const [showHardPaywall, setShowHardPaywall] = useState(false);

  function requireAccess(): boolean {
    if (isExpired) { setShowHardPaywall(true); return false; }
    return true;
  }

  const [tab, setTab]                       = useState<"updates" | "approvals" | "files" | "details">("updates");
  const [readMessages, setReadMessages]     = useState<string | null>(null);
  const [readApprovals, setReadApprovals]   = useState<string | null>(null);

  // Load last-read timestamps from localStorage and mark initial tab as read
  useEffect(() => {
    const rm = localStorage.getItem(`handoff_read_messages_${id}`);
    const ra = localStorage.getItem(`handoff_read_approvals_${id}`);
    setReadMessages(rm);
    setReadApprovals(ra);
    // Mark the default tab (updates) as read on open
    markMessagesRead(id);
    setReadMessages(new Date().toISOString());
  }, [id]);
  const [updateText, setUpdateText]         = useState("");
  const [updateFiles, setUpdateFiles]       = useState<File[]>([]);
  const [updateFileError, setUpdateFileError] = useState<string | null>(null);
  const [submitting, setSubmitting]         = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [newApproval, setNewApproval]       = useState({ title: "", description: "" });
  const [approvalFiles, setApprovalFiles]   = useState<File[]>([]);
  const [approvalFileError, setApprovalFileError] = useState<string | null>(null);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [deleting, setDeleting]             = useState(false);
  // Revise & resend state
  const [revisingId, setRevisingId]         = useState<string | null>(null);
  const [reviseForm, setReviseForm]         = useState({ title: "", description: "" });
  const [reviseSubmitting, setReviseSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <p className="text-[14px] font-semibold text-gray-700">Project not found</p>
        <Link href="/dashboard" className="text-[13px] text-emerald-600 hover:text-emerald-500">← Back to projects</Link>
      </div>
    );
  }

  const s = statusConfig[project.status] ?? statusConfig["Ready to work"];
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const hasUnreadMessages  = messages.some((m: Message) => m.role === "client" && (!readMessages  || m.created_at  > readMessages));
  const hasUnreadApprovals = approvals.some((a: Approval) => a.status !== "pending" && (!readApprovals || a.updated_at > readApprovals));

  async function handleDelete() {
    if (!confirm(`Delete "${project?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteProject(id);
    router.push("/dashboard");
  }

  function switchTab(t: "updates" | "approvals" | "files" | "details") {
    setTab(t);
    const now = new Date().toISOString();
    if (t === "updates")   { markMessagesRead(id);  setReadMessages(now); }
    if (t === "approvals") { markApprovalsRead(id); setReadApprovals(now); }
  }
  const canPost = updateText.trim().length > 0 || updateFiles.length > 0;

  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  function copyPortalLink() {
    navigator.clipboard.writeText(`${window.location.origin}/p/${project!.share_token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function postUpdate() {
    if (!requireAccess() || !canPost || submitting) return;
    setSubmitting(true);
    let uploadedFiles: FileAttachment[] = [];
    if (updateFiles.length > 0) {
      const results = await Promise.all(updateFiles.map((f) => uploadFileDirect(id, f)));
      uploadedFiles = results.filter((r): r is FileAttachment => r !== null);
    }
    const { error } = await postMessage(id, updateText.trim(), uploadedFiles);
    if (!error) {
      setUpdateText("");
      setUpdateFiles([]);
      await refetchMessages();
    }
    setSubmitting(false);
  }

  async function requestApproval() {
    if (!requireAccess() || !newApproval.title.trim() || approvalSubmitting) return;
    setApprovalSubmitting(true);
    let uploadedFiles: FileAttachment[] = [];
    if (approvalFiles.length > 0) {
      const results = await Promise.all(approvalFiles.map((f) => uploadFileDirect(id, f)));
      uploadedFiles = results.filter((r): r is FileAttachment => r !== null);
    }
    const { error } = await createApproval(id, newApproval.title, newApproval.description, uploadedFiles);
    if (!error) {
      setNewApproval({ title: "", description: "" });
      setApprovalFiles([]);
      setShowApprovalForm(false);
      await refetchApprovals();
    }
    setApprovalSubmitting(false);
  }

  async function handleRevise() {
    if (!revisingId || !reviseForm.title.trim() || reviseSubmitting) return;
    setReviseSubmitting(true);
    const { error } = await reviseApproval(revisingId, reviseForm.title, reviseForm.description);
    if (!error) {
      setRevisingId(null);
      setReviseForm({ title: "", description: "" });
      await refetchApprovals();
    }
    setReviseSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
      {showHardPaywall && <HardPaywall onClose={() => setShowHardPaywall(false)} />}

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors text-[13px]">← Projects</Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-[15px] font-semibold text-gray-900">{project.name}</h1>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {project.status}
          </span>
        </div>
        <button
          onClick={copyPortalLink}
          className={`cursor-pointer text-[13px] font-semibold px-4 py-2 rounded-lg transition-all ${copied ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-black"}`}
        >
          {copied ? "Copied ✓" : "Copy client link"}
        </button>
      </div>

      <div className="px-8 py-7 max-w-5xl mx-auto">

        {/* Project header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6 mb-5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{project.name}</h2>
              {project.description && (
                <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">{project.description}</p>
              )}
            </div>
            <div className="flex gap-8 shrink-0 text-right">
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Client</p>
                <p className="text-[13px] font-semibold text-gray-900">{project.client_name || "—"}</p>
                <p className="text-[11px] text-gray-400">{project.client_email || ""}</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Deadline</p>
                <p className="text-[13px] font-semibold text-gray-900">{deadline}</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Value</p>
                <p className="text-[15px] font-bold text-emerald-600">
                  {project.amount ? `$${Number(project.amount).toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-1 mb-5 w-fit">
          {(["updates", "approvals", "files", "details"] as const).map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`cursor-pointer px-4 py-2 rounded-lg text-[13px] font-medium transition-all capitalize relative ${tab === t ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              {t}
              {t === "approvals" && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-black">
                  {pendingCount}
                </span>
              )}
              {t === "updates"   && hasUnreadMessages  && tab !== "updates"   && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
              {t === "approvals" && hasUnreadApprovals && tab !== "approvals" && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
            </button>
          ))}
        </div>

        {/* ── Updates ──────────────────────────────────────────────────────── */}
        {tab === "updates" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Post an update</p>
              <textarea
                value={updateText} onChange={(e) => setUpdateText(e.target.value)}
                placeholder="e.g. Logo V3 uploaded — let me know your preference before I proceed…"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all resize-none"
              />
              {updateFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {updateFiles.map((f, i) => {
                    const type = extType(f.name);
                    const icon = fileIconMap[type] ?? fileIconMap.default;
                    return (
                      <div key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 ${icon.bg}`}>
                        <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
                        <span className="text-[11px] font-medium text-gray-700 max-w-[140px] truncate">{f.name}</span>
                        <span className="text-[10px] text-gray-400">{fileSizeFromFile(f)}</span>
                        <button onClick={() => setUpdateFiles((prev) => prev.filter((_, idx) => idx !== i))} className="cursor-pointer text-gray-400 hover:text-gray-700 ml-0.5 text-[11px]">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
              {updateFileError && (
                <p className="text-[11px] text-red-500 mt-2">{updateFileError}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <FilePickerButton
                    onFiles={(f) => { setUpdateFileError(null); setUpdateFiles((prev) => [...prev, ...f]); }}
                    onError={(msg) => setUpdateFileError(msg)}
                  />
                  <p className="text-[11px] text-gray-400">Up to 10MB per file</p>
                </div>
                <button onClick={postUpdate} disabled={!canPost || submitting}
                  className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors"
                >
                  {submitting ? (updateFiles.length > 0 ? "Uploading…" : "Posting…") : "Post update"}
                </button>
              </div>
            </div>

            {messagesLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 flex justify-center">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-[13px] text-gray-400">No updates yet. Post the first one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((u: Message) => {
                  const isClient = u.role === "client";
                  const initials = u.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={u.id} className={`rounded-xl border p-4 ${isClient ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${isClient ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[13px] font-semibold text-gray-900">{u.author_name}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isClient ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-700"}`}>
                              {isClient ? "Client" : "You"}
                            </span>
                            <p className="text-[11px] text-gray-400 ml-auto">{formatTime(u.created_at)}</p>
                          </div>
                          {u.body && <p className="text-[13px] text-gray-600 leading-relaxed">{u.body}</p>}
                          <AttachmentList files={u.files} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {hasMoreMessages && (
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={() => loadMoreMessages(messages[messages.length - 1].created_at)}
                      disabled={loadingMoreMessages}
                      className="cursor-pointer text-[12px] font-medium text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {loadingMoreMessages ? "Loading…" : "Load older messages"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Approvals ────────────────────────────────────────────────────── */}
        {tab === "approvals" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Approval requests</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Send a sign-off request to your client. They approve or flag changes on their portal.</p>
              </div>
              <button onClick={() => { if (requireAccess()) setShowApprovalForm((v) => !v); }}
                className="cursor-pointer text-[12px] font-semibold px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white transition-colors shrink-0 ml-6"
              >
                + New request
              </button>
            </div>

            {showApprovalForm && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">What needs approval?</label>
                  <input type="text" placeholder="e.g. Logo direction — Option B"
                    value={newApproval.title} onChange={(e) => setNewApproval({ ...newApproval, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Context for client (optional)</label>
                  <textarea placeholder="e.g. Please confirm before I proceed to final production files…"
                    value={newApproval.description} onChange={(e) => setNewApproval({ ...newApproval, description: e.target.value })}
                    rows={2} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all resize-none"
                  />
                </div>
                {approvalFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {approvalFiles.map((f, i) => {
                      const type = extType(f.name);
                      const icon = fileIconMap[type] ?? fileIconMap.default;
                      return (
                        <div key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 ${icon.bg}`}>
                          <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
                          <span className="text-[11px] font-medium text-gray-700 max-w-[140px] truncate">{f.name}</span>
                          <span className="text-[10px] text-gray-400">{fileSizeFromFile(f)}</span>
                          <button onClick={() => setApprovalFiles((prev) => prev.filter((_, idx) => idx !== i))} className="cursor-pointer text-gray-400 hover:text-gray-700 ml-0.5 text-[11px]">✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {approvalFileError && (
                  <p className="text-[11px] text-red-500">{approvalFileError}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <FilePickerButton
                    onFiles={(f) => { setApprovalFileError(null); setApprovalFiles((prev) => [...prev, ...f]); }}
                    onError={(msg) => setApprovalFileError(msg)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowApprovalForm(false); setApprovalFiles([]); }}
                      className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >Cancel</button>
                    <button onClick={requestApproval} disabled={!newApproval.title.trim() || approvalSubmitting}
                      className="cursor-pointer px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-[12px] font-semibold transition-colors"
                    >
                      {approvalSubmitting ? (approvalFiles.length > 0 ? "Uploading…" : "Sending…") : "Send to client"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {approvalsLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 flex justify-center">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : approvals.length === 0 && !showApprovalForm ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-[13px] text-gray-400">No approval requests yet. Create one above.</p>
              </div>
            ) : (
              approvals.map((a: Approval) => {
                const cfg = approvalStatusConfig[a.status];
                const isRevising = revisingId === a.id;
                return (
                  <div key={a.id} className={`bg-white rounded-xl border shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5 ${a.status === "changes_requested" ? "border-red-200" : "border-gray-100"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[14px] font-semibold text-gray-900">{a.title}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
                        </div>
                        {a.description && <p className="text-[12px] text-gray-500 leading-relaxed">{a.description}</p>}
                        <AttachmentList files={a.files} />
                        <p className="text-[11px] text-gray-400 mt-2">Requested {formatTime(a.created_at)}</p>

                        {/* Client's change note */}
                        {a.status === "changes_requested" && a.client_note && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-[10px] font-semibold text-red-500 uppercase tracking-widest mb-1">Client feedback</p>
                            <p className="text-[13px] text-red-700 leading-relaxed">{a.client_note}</p>
                          </div>
                        )}
                        {a.status === "changes_requested" && !a.client_note && (
                          <p className="text-[11px] text-red-400 mt-2 italic">Client requested changes (no note left)</p>
                        )}
                      </div>
                      {a.status === "changes_requested" && !isRevising && (
                        <button
                          onClick={() => { setRevisingId(a.id); setReviseForm({ title: a.title, description: a.description ?? "" }); }}
                          className="cursor-pointer text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-700 text-white transition-all shrink-0"
                        >
                          Revise &amp; resend
                        </button>
                      )}
                    </div>

                    {/* Revise inline form */}
                    {isRevising && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Revise request</p>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">What needs approval?</label>
                          <input
                            type="text"
                            value={reviseForm.title}
                            onChange={(e) => setReviseForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Context for client (optional)</label>
                          <textarea
                            value={reviseForm.description}
                            onChange={(e) => setReviseForm((f) => ({ ...f, description: e.target.value }))}
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all resize-none"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => { setRevisingId(null); setReviseForm({ title: "", description: "" }); }}
                            className="cursor-pointer flex-1 py-2.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRevise}
                            disabled={!reviseForm.title.trim() || reviseSubmitting}
                            className="cursor-pointer flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-[12px] font-semibold transition-colors"
                          >
                            {reviseSubmitting ? "Sending…" : "Resend to client ✓"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Files ────────────────────────────────────────────────────────── */}
        {tab === "files" && (() => {
          const allFiles = [
            ...messages.flatMap((m: Message) =>
              (Array.isArray(m.files) ? m.files as FileAttachment[] : []).map((f) => ({
                ...f,
                from: m.author_name,
                role: m.role as string,
                date: m.created_at,
                source: "message" as const,
              }))
            ),
            ...approvals.flatMap((a: Approval) =>
              (Array.isArray(a.files) ? a.files as FileAttachment[] : []).map((f) => ({
                ...f,
                from: a.title,
                role: "approval" as string,
                date: a.created_at,
                source: "approval" as const,
              }))
            ),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (allFiles.length === 0) {
            return (
              <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-10 text-center">
                <p className="text-[13px] text-gray-400">No files yet. Attach files to updates or approval requests.</p>
              </div>
            );
          }

          return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] divide-y divide-gray-50">
              {allFiles.map((f, i) => {
                const icon = fileIconMap[f.type] ?? fileIconMap.default;
                const isClient = f.role === "client";
                const isApproval = f.source === "approval";
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${icon.bg}`}>
                      <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">{f.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isApproval ? "bg-amber-50 text-amber-600" : isClient ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-700"}`}>
                          {isApproval ? `Approval: ${f.from}` : isClient ? f.from : "You"}
                        </span>
                        <span className="text-[11px] text-gray-400">{f.size}</span>
                        <span className="text-[11px] text-gray-400">·</span>
                        <span className="text-[11px] text-gray-400">{formatTime(f.date)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(f.url, f.name)}
                      className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2v9M5 8l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── Details ──────────────────────────────────────────────────────── */}
        {tab === "details" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6 space-y-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Project details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Project name</label>
                <input defaultValue={project.name} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Client name</label>
                <input defaultValue={project.client_name ?? ""} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Client email</label>
                <input defaultValue={project.client_email ?? ""} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Deadline</label>
                <input type="date" defaultValue={project.deadline ?? ""} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Project value (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">$</span>
                  <input type="number" defaultValue={project.amount ?? ""} className="w-full border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Status</label>
                <select defaultValue={project.status} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all bg-white">
                  {["Ready to work","In Progress","Under Review","Completed","Parked"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Project description</label>
              <textarea defaultValue={project.description ?? ""} rows={3} className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all resize-none" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="cursor-pointer text-[13px] font-medium text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete project"}
              </button>
              <button className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors">Save changes</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
