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

  if (error) { console.error("Messages error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
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

  if (error) { console.error("Messages error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
}

// Client replies — validated by share token, uses service role to bypass RLS
export async function postClientMessage(
  shareToken: string,
  clientName: string,
  body: string,
  files: FileAttachment[]
) {
  const service = createServiceClient();

  // Validate token and fetch fields needed for notification
  const { data: project, error: projectError } = await service
    .from("projects")
    .select("id, name, owner_id, client_name, last_client_notified_at")
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

  // Send notification email to freelancer — max once per hour per project
  const lastNotified = project.last_client_notified_at ? new Date(project.last_client_notified_at).getTime() : 0;
  const shouldNotify = Date.now() - lastNotified > HOUR;

  if (!error && shouldNotify) {
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerk = await clerkClient();
      const owner = await clerk.users.getUser(project.owner_id);
      const ownerEmail = owner.emailAddresses[0]?.emailAddress;

      if (ownerEmail) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const preview = body?.trim() ? (body.length > 120 ? body.slice(0, 120) + "…" : body) : files.length > 0 ? `Shared ${files.length} file${files.length > 1 ? "s" : ""}` : "Sent a message";

        await resend.emails.send({
          from: "Handoff <hello@gethandoff.co>",
          to: ownerEmail,
          subject: `${project.client_name ?? clientName} replied on ${project.name}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
              <div style="display: flex; align-items: center; margin-bottom: 28px;">
                <img src="https://gethandoff.co/handoff-logo.png" alt="Handoff" width="36" height="36" style="border-radius: 8px; margin-right: 10px;" />
                <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #111827;">Hand<span style="color: #10b981;">off</span></span>
              </div>
              <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 6px;">${project.client_name ?? clientName} left a message</h1>
              <p style="font-size: 13px; color: #6b7280; margin: 0 0 20px;">on <strong style="color: #111827;">${project.name}</strong></p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-left: 3px solid #10b981; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6;">${preview}</p>
              </div>
              <a href="https://www.gethandoff.co/dashboard/project/${project.id}" style="display: inline-block; background: #10b981; color: #000; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
                View message →
              </a>
              <p style="font-size: 12px; color: #d1d5db; margin-top: 32px;">Handoff — Client portals for freelancers · <a href="https://www.gethandoff.co" style="color: #d1d5db;">gethandoff.co</a></p>
            </div>
          `,
        });

        await service
          .from("projects")
          .update({ last_client_notified_at: new Date().toISOString() } as never)
          .eq("id", project.id);
      }
    } catch {
      // Non-blocking — don't fail the message post if email fails
    }
  }

  if (error) { console.error("Messages error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
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
