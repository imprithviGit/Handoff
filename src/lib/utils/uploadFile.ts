import { createClient } from "@/lib/supabase/client";
import type { FileAttachment } from "@/lib/supabase/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const FILE_TYPE_MAP: Record<string, string> = {
  pdf: "pdf", fig: "figma", figma: "figma",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image",
  doc: "doc", docx: "doc", xls: "sheet", xlsx: "sheet", csv: "sheet", zip: "zip",
};

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb < 0.1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(1)} MB`;
}

/**
 * Uploads a file directly from the browser to Supabase Storage via a signed URL.
 * Avoids the double-upload penalty of going through a server action.
 * For authenticated freelancer uploads.
 */
export async function uploadFileDirect(
  projectId: string,
  file: File
): Promise<FileAttachment | null> {
  if (file.size > MAX_FILE_BYTES) return null;

  // 1. Get a signed upload URL from our API route (lightweight — no file data)
  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, filename: file.name }),
  });
  if (!res.ok) return null;
  const { signedUrl, path, token } = await res.json();

  // 2. Upload directly from browser to Supabase Storage
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("project-files")
    .uploadToSignedUrl(path, token, file);
  if (error) return null;

  // 3. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from("project-files")
    .getPublicUrl(path);

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();

  return {
    name: file.name,
    size: formatSize(file.size),
    type: FILE_TYPE_MAP[ext] ?? "default",
    url: publicUrl,
    path,
  };
}

/**
 * Same as above but for unauthenticated client portal uploads,
 * validated by share token.
 */
export async function uploadClientFileDirect(
  shareToken: string,
  file: File
): Promise<FileAttachment | null> {
  if (file.size > MAX_FILE_BYTES) return null;

  const res = await fetch("/api/upload-url-client", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shareToken, filename: file.name }),
  });
  if (!res.ok) return null;
  const { path, token } = await res.json();

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("project-files")
    .uploadToSignedUrl(path, token, file);
  if (error) return null;

  const { data: { publicUrl } } = supabase.storage
    .from("project-files")
    .getPublicUrl(path);

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();

  return {
    name: file.name,
    size: formatSize(file.size),
    type: FILE_TYPE_MAP[ext] ?? "default",
    url: publicUrl,
    path,
  };
}
