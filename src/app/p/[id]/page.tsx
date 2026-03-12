"use client";

import { useState, use, useRef } from "react";
import Link from "next/link";
import { useClientPortal } from "@/lib/hooks/useProjectData";
import { postClientMessage, uploadClientFile } from "@/lib/actions/messages";
import { decideApproval } from "@/lib/actions/approvals";
import type { Message, Approval, FileAttachment } from "@/lib/supabase/types";

// ── config ────────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  "Ready to work": { dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200"  },
  "In Progress":   { dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200"    },
  "Under Review":  { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  "Completed":     { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  "Parked":        { dot: "bg-gray-400",    text: "text-gray-500",    bg: "bg-gray-100",   border: "border-gray-200"    },
};

const fileIconMap: Record<string, { icon: string; bg: string; color: string }> = {
  pdf:    { icon: "PDF",  bg: "bg-red-50",     color: "text-red-500"    },
  figma:  { icon: "FIG",  bg: "bg-purple-50",  color: "text-purple-600" },
  image:  { icon: "IMG",  bg: "bg-blue-50",    color: "text-blue-500"   },
  doc:    { icon: "DOC",  bg: "bg-sky-50",     color: "text-sky-600"    },
  sheet:  { icon: "XLS",  bg: "bg-emerald-50", color: "text-emerald-600"},
  zip:    { icon: "ZIP",  bg: "bg-gray-100",   color: "text-gray-500"   },
  default:{ icon: "FILE", bg: "bg-gray-100",   color: "text-gray-500"   },
};

// ── helpers ───────────────────────────────────────────────────────────────────

function fileSizeFromFile(f: File): string {
  const mb = f.size / (1024 * 1024);
  return mb < 0.1 ? `${Math.round(f.size / 1024)} KB` : `${mb.toFixed(1)} MB`;
}

function extType(name: string): string {
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
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
          <button key={i} onClick={() => downloadFile(f.url, f.name)} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer ${icon.bg}`}>
            <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
            <span className="text-[11px] font-medium text-gray-700 max-w-[160px] truncate">{f.name}</span>
            <span className="text-[10px] text-gray-400">{f.size}</span>
            <svg className="w-3 h-3 text-gray-400 ml-0.5" viewBox="0 0 12 12" fill="none">
              <path d="M2 8.5v1a.5.5 0 00.5.5h7a.5.5 0 00.5-.5v-1M6 2v6M3.5 5.5L6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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

export default function ClientPortal({ params }: { params: Promise<{ id: string }> }) {
  const { id: token } = use(params);
  const { project, messages, setMessages, approvals, setApprovals, loading, hasMoreMessages, loadingMoreMessages, loadMoreMessages } = useClientPortal(token);

  const [replyText, setReplyText]     = useState("");
  const [replyFiles, setReplyFiles]   = useState<File[]>([]);
  const [replyFileError, setReplyFileError] = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [section, setSection]       = useState<"updates" | "files" | "approvals">("updates");
  const [decidingId, setDecidingId] = useState<string | null>(null);
  // "Request changes" note flow
  const [requestingChangeId, setRequestingChangeId] = useState<string | null>(null);
  const [changeNote, setChangeNote]                 = useState("");
  const [copiedShare, setCopiedShare]               = useState(false);

  function copyHandoffLink() {
    navigator.clipboard.writeText("https://handoff.so");
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-6" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mb-4">🔒</div>
        <h1 className="text-lg font-bold text-gray-900 mb-1">This link is invalid or has expired</h1>
        <p className="text-[13px] text-gray-400 max-w-xs">Ask your freelancer to resend the project link.</p>
      </div>
    );
  }

  const s = statusConfig[project.status] ?? statusConfig["In Progress"];
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const canReply = replyText.trim().length > 0 || replyFiles.length > 0;

  const deadline = project.deadline ? formatDate(project.deadline) : null;

  const freelancerFiles = messages
    .filter((m: Message) => m.role === "freelancer" && Array.isArray(m.files) && m.files.length > 0)
    .flatMap((m: Message) => (m.files as FileAttachment[]).map((f) => ({ ...f, date: m.created_at, postedBy: m.author_name })));

  async function postReply() {
    if (!canReply || submitting) return;
    setSubmitting(true);
    const clientName = project!.client_name ?? "Client";
    let uploadedFiles: FileAttachment[] = [];
    if (replyFiles.length > 0) {
      const results = await Promise.all(replyFiles.map((f) => uploadClientFile(token, f)));
      uploadedFiles = results.filter((r): r is FileAttachment => r !== null);
    }
    const { data, error } = await postClientMessage(token, clientName, replyText.trim(), uploadedFiles);
    if (!error && data) {
      setMessages((prev: Message[]) => [data, ...prev]);
      setReplyText("");
      setReplyFiles([]);
    }
    setSubmitting(false);
  }

  async function decide(approvalId: string, decision: "approved" | "changes_requested", note?: string) {
    setDecidingId(approvalId);
    const { error } = await decideApproval(token, approvalId, decision, note);
    if (!error) {
      setApprovals((prev: Approval[]) => prev.map((a) =>
        a.id === approvalId ? { ...a, status: decision, client_note: note ?? null } : a
      ));
      setRequestingChangeId(null);
      setChangeNote("");
    }
    setDecidingId(null);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Hand<span className="text-emerald-500">off</span></span>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-[14px] font-medium text-gray-600">{project.name}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {project.status}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,640px)_240px] xl:grid-cols-[280px_minmax(0,640px)_280px] gap-8 items-start justify-center">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-3 sticky top-8">
          {/* Project details card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Project details</p>
            <div className="space-y-3.5">
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {project.status}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Working with</p>
                <p className="text-[12px] font-semibold text-gray-900">{project.freelancer_name}</p>
              </div>
              {project.created_at && (
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Started</p>
                  <p className="text-[12px] font-semibold text-gray-900">{formatDate(project.created_at)}</p>
                </div>
              )}
              {deadline && (
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Deadline</p>
                  <p className="text-[12px] font-semibold text-gray-900">{deadline}</p>
                </div>
              )}
              {messages.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Last update</p>
                  <p className="text-[12px] font-semibold text-gray-900">{formatTime(messages[0].created_at)}</p>
                </div>
              )}
              {pendingApprovals.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Needs sign-off</p>
                  <button
                    onClick={() => setSection("approvals")}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {pendingApprovals.length} pending
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Share nudge */}
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-center">
            <p className="text-[11px] font-semibold text-gray-600 mb-0.5">Know a freelancer?</p>
            <p className="text-[10px] text-gray-400 mb-3">Share Handoff — they'll love it.</p>
            <button
              onClick={copyHandoffLink}
              className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-[11px] font-semibold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg transition-all"
            >
              {copiedShare ? "Copied ✓" : "Copy link 🔗"}
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div>

        {/* Project card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-6 mb-5">
          {/* Metadata bar */}
          <div className="flex items-center gap-2 flex-wrap mb-3 text-[11px] text-gray-400">
            <span className={`inline-flex items-center gap-1 font-medium ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{project.status}
            </span>
            {messages.length > 0 && (
              <><span className="text-gray-200">·</span><span>Updated {formatTime(messages[0].created_at)}</span></>
            )}
            {messages.length > 0 && (
              <><span className="text-gray-200">·</span><span>{messages.length}{hasMoreMessages ? "+" : ""} updates</span></>
            )}
            {pendingApprovals.length > 0 && (
              <><span className="text-gray-200">·</span>
              <button onClick={() => setSection("approvals")} className="cursor-pointer text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                {pendingApprovals.length} pending approval{pendingApprovals.length > 1 ? "s" : ""}
              </button></>
            )}
          </div>
          <h1 className="text-[18px] font-bold text-gray-900 mb-1">{project.name}</h1>
          {project.description && (
            <p className="text-[13px] text-gray-400 leading-relaxed mb-4">{project.description}</p>
          )}
          <div className="flex items-center gap-5 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">Your contact</p>
              <p className="text-[13px] font-semibold text-gray-900">{project.freelancer_name}</p>
            </div>
            {deadline && (
              <>
                <div className="w-px h-7 bg-gray-100" />
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Deadline</p>
                  <p className="text-[13px] font-semibold text-gray-900">{deadline}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-1 mb-5">
          {([
            { key: "updates",  label: "Updates",   count: messages.length,       hasMore: hasMoreMessages },
            { key: "files",    label: "Files",      count: freelancerFiles.length, hasMore: false },
            { key: "approvals",label: "Approvals",  count: approvals.length,       hasMore: false },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setSection(t.key)}
              className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${section === t.key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[11px] font-semibold ${section === t.key ? "text-white/50" : "text-gray-400"}`}>
                  {t.count}{t.hasMore ? "+" : ""}
                </span>
              )}
              {t.key === "approvals" && pendingApprovals.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-black">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Updates ────────────────────────────────────────────────────────── */}
        {section === "updates" && (
          <div className="space-y-3">
            {/* Conversational reply box */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-4 pt-4 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  {(project.client_name ?? "C").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) postReply(); }}
                    placeholder="Add a comment…"
                    rows={2}
                    className="w-full border-0 border-b border-gray-100 pb-2 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-emerald-300 transition-colors resize-none bg-transparent"
                  />
                  {replyFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {replyFiles.map((f, i) => {
                        const type = extType(f.name);
                        const icon = fileIconMap[type] ?? fileIconMap.default;
                        return (
                          <div key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 ${icon.bg}`}>
                            <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
                            <span className="text-[11px] font-medium text-gray-700 max-w-[140px] truncate">{f.name}</span>
                            <span className="text-[10px] text-gray-400">{fileSizeFromFile(f)}</span>
                            <button onClick={() => setReplyFiles((prev) => prev.filter((_, idx) => idx !== i))} className="cursor-pointer text-gray-400 hover:text-gray-700 ml-0.5 text-[11px] leading-none">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {replyFileError && (
                    <p className="text-[11px] text-red-500 mt-2">{replyFileError}</p>
                  )}
                  <div className="flex items-center justify-between mt-2.5">
                    <FilePickerButton
                      onFiles={(f) => { setReplyFileError(null); setReplyFiles((prev) => [...prev, ...f]); }}
                      onError={(msg) => setReplyFileError(msg)}
                    />
                    <button onClick={postReply} disabled={!canReply || submitting}
                      className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-[12px] px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      {submitting ? (replyFiles.length > 0 ? "Uploading…" : "Sending…") : "Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-[13px] text-gray-400">No updates yet from your freelancer.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((u: Message) => {
                  const isMe = u.role === "client";
                  const initials = u.author_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  const hasFiles = Array.isArray(u.files) && u.files.length > 0;
                  const hasBody = u.body && u.body.trim().length > 0;
                  // entry type label
                  const entryTag = !isMe
                    ? (hasFiles && !hasBody ? "Shared files" : hasFiles ? "Update + files" : "Update")
                    : null;
                  return (
                    <div key={u.id} className={`rounded-xl p-4 ${isMe ? "bg-white border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)]" : "bg-gray-50 border border-gray-100 border-l-[3px] border-l-emerald-300"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${isMe ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="text-[13px] font-semibold text-gray-900">{u.author_name}</p>
                            {entryTag && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                {entryTag}
                              </span>
                            )}
                            {isMe && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600">
                                You
                              </span>
                            )}
                            <p className="text-[11px] text-gray-400 ml-auto">{formatTime(u.created_at)}</p>
                          </div>
                          {hasBody && <p className="text-[13px] text-gray-600 leading-relaxed">{u.body}</p>}
                          {!hasBody && hasFiles && <p className="text-[13px] text-gray-400 italic">Shared {u.files.length} file{u.files.length > 1 ? "s" : ""}</p>}
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

        {/* ── Files ──────────────────────────────────────────────────────────── */}
        {section === "files" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
            {freelancerFiles.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[13px] text-gray-400">No files shared yet.</p>
                <p className="text-[11px] text-gray-300 mt-1">Files shared by your freelancer will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {freelancerFiles.map((f, i) => {
                  const icon = fileIconMap[f.type] ?? fileIconMap.default;
                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${icon.bg}`}>
                        <span className={`text-[10px] font-bold ${icon.color}`}>{icon.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate">{f.name}</p>
                        <p className="text-[11px] text-gray-400">{f.size} · {formatTime(f.date)} · {f.postedBy}</p>
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-emerald-600 hover:text-emerald-500 transition-colors shrink-0">
                        Download ↓
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Approvals ──────────────────────────────────────────────────────── */}
        {section === "approvals" && (
          <div className="space-y-3">
            {approvals.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-[13px] text-gray-400">No approval requests yet.</p>
              </div>
            )}
            {approvals.map((a: Approval) => {
              const isPending = a.status === "pending";
              const isDeciding = decidingId === a.id;
              return (
                <div key={a.id} className={`bg-white rounded-xl border shadow-[0_1px_4px_rgba(0,0,0,0.05)] p-5 ${isPending ? "border-amber-200" : "border-gray-100"}`}>
                  {isPending && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Waiting for your approval
                    </div>
                  )}
                  <p className="text-[14px] font-semibold text-gray-900 mb-1">{a.title}</p>
                  {a.description && (
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-1">{a.description}</p>
                  )}
                  <AttachmentList files={a.files} />
                  <p className="text-[11px] text-gray-400 mt-2">Requested {formatTime(a.created_at)}</p>
                  {isPending && requestingChangeId !== a.id && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => { setRequestingChangeId(a.id); setChangeNote(""); }}
                        disabled={isDeciding}
                        className="cursor-pointer flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900 disabled:opacity-40 transition-all"
                      >
                        Request changes
                      </button>
                      <button onClick={() => decide(a.id, "approved")} disabled={isDeciding}
                        className="cursor-pointer flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black text-[13px] font-semibold transition-colors"
                      >
                        {isDeciding ? "Saving…" : "Approve ✓"}
                      </button>
                    </div>
                  )}

                  {isPending && requestingChangeId === a.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">What needs to change?</p>
                      <textarea
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        placeholder="Describe what you'd like revised…"
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300/30 focus:border-red-300 transition-all resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setRequestingChangeId(null); setChangeNote(""); }}
                          className="cursor-pointer flex-1 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => decide(a.id, "changes_requested", changeNote.trim() || undefined)}
                          disabled={isDeciding}
                          className="cursor-pointer flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white text-[13px] font-semibold transition-colors"
                        >
                          {isDeciding ? "Sending…" : "Send feedback"}
                        </button>
                      </div>
                    </div>
                  )}
                  {a.status === "approved" && (
                    <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Approved ✓</span>
                    </div>
                  )}
                  {a.status === "changes_requested" && (
                    <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">Changes requested</span>
                      <p className="text-[11px] text-gray-400 ml-1">Your freelancer will follow up shortly.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-14 py-8 border-t border-gray-100 flex flex-col items-center gap-3">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              Hand<span className="text-emerald-500">off</span>
            </span>
          </Link>
          <p className="text-[13px] text-gray-400">
            Client portals for freelancers —{" "}
            <Link href="/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:text-emerald-500 transition-colors">
              get yours free
            </Link>
          </p>
        </div>

        </div>{/* end main content */}

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-3 sticky top-8">
          {/* Freelancer CTA — dark */}
          <div className="bg-gray-950 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-3">👋 Are you a freelancer?</p>
            <p className="text-[14px] font-bold text-white leading-snug mb-2">
              Give every client a portal like this one.
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
              No account needed for clients. No chasing emails for you. Set up in 30 seconds.
            </p>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-emerald-500 hover:bg-emerald-400 text-black text-[12px] font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Try Handoff free →
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}
