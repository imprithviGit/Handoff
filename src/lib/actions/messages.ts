"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { FileAttachment } from "@/lib/supabase/types";
import { isRateLimited } from "@/lib/rateLimit";

const HOUR = 60 * 60 * 1000;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function getMessages(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

// Freelancer posts an update
export async function postMessage(projectId: string, body: string, files: FileAttachment[]) {
  if (await isRateLimited("messages", projectId, 100, HOUR))
    return { data: null, error: "Too many updates — slow down a bit." };

  const { userId } = await (await import("@clerk/nextjs/server")).auth();
  if (!userId) return { data: null, error: "Not authenticated" };

  const clerkUser = await (await (await import("@clerk/nextjs/server")).clerkClient()).users.getUser(userId);
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
  const authorName = fullName || clerkUser.emailAddresses[0]?.emailAddress || "Freelancer";

  const service = createServiceClient();
  const { data, error } = await service
    .from("messages")
    .insert({ project_id: projectId, role: "freelancer", author_name: authorName, body, files })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

// Client replies — validated by share token, uses service role to bypass RLS
export async function postClientMessage(
  shareToken: string,
  clientName: string,
  body: string,
  files: FileAttachment[]
) {
  const service = createServiceClient();

  // Validate token
  const { data: project, error: projectError } = await service
    .from("projects")
    .select("id")
    .eq("share_token", shareToken)
    .single();

  if (projectError || !project) return { data: null, error: "Invalid link" };

  if (await isRateLimited("messages", project.id, 100, HOUR))
    return { data: null, error: "Too many messages — please wait before sending again." };

  const { data, error } = await service
    .from("messages")
    .insert({ project_id: project.id, role: "client", author_name: clientName, body, files })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

// Upload a file to Supabase Storage, return the public URL + path
export async function uploadFile(projectId: string, file: File): Promise<FileAttachment | null> {
  if (file.size > MAX_FILE_BYTES) return null;
  const supabase = createServiceClient();
  const ext  = file.name.split(".").pop();
  const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("project-files").upload(path, file);
  if (error) return null;

  const { data: { publicUrl } } = supabase.storage.from("project-files").getPublicUrl(path);

  const mb = file.size / (1024 * 1024);
  const size = mb < 0.1 ? `${Math.round(file.size / 1024)} KB` : `${mb.toFixed(1)} MB`;
  const ext2 = (file.name.split(".").pop() ?? "").toLowerCase();
  const typeMap: Record<string, string> = {
    pdf: "pdf", fig: "figma", figma: "figma",
    png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image",
    doc: "doc", docx: "doc", xls: "sheet", xlsx: "sheet", csv: "sheet", zip: "zip",
  };

  return { name: file.name, size, type: typeMap[ext2] ?? "default", url: publicUrl, path };
}

// Client file upload — validated by share token
export async function uploadClientFile(shareToken: string, file: File): Promise<FileAttachment | null> {
  if (file.size > MAX_FILE_BYTES) return null;
  const service = createServiceClient();

  const { data: project } = await service
    .from("projects")
    .select("id")
    .eq("share_token", shareToken)
    .single();

  if (!project) return null;

  const ext  = file.name.split(".").pop();
  const path = `${project.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await service.storage.from("project-files").upload(path, file);
  if (error) return null;

  const { data: { publicUrl } } = service.storage.from("project-files").getPublicUrl(path);

  const mb   = file.size / (1024 * 1024);
  const size = mb < 0.1 ? `${Math.round(file.size / 1024)} KB` : `${mb.toFixed(1)} MB`;
  const ext2 = (file.name.split(".").pop() ?? "").toLowerCase();
  const typeMap: Record<string, string> = {
    pdf: "pdf", fig: "figma", figma: "figma",
    png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image",
    doc: "doc", docx: "doc", xls: "sheet", xlsx: "sheet", csv: "sheet", zip: "zip",
  };

  return { name: file.name, size, type: typeMap[ext2] ?? "default", url: publicUrl, path };
}
