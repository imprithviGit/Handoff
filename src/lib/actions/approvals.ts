"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { FileAttachment } from "@/lib/supabase/types";
import { isRateLimited } from "@/lib/rateLimit";

const HOUR = 60 * 60 * 1000;

export async function getApprovals(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

// Uses service client until real auth is wired
export async function createApproval(projectId: string, title: string, description: string, files: FileAttachment[]) {
  if (await isRateLimited("approvals", projectId, 20, HOUR))
    return { data: null, error: "Too many approval requests — try again later." };

  const service = createServiceClient();
  const { data, error } = await service
    .from("approvals")
    .insert({ project_id: projectId, title, description, files })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

// Client decides — validated by share token, uses service role
export async function decideApproval(
  shareToken: string,
  approvalId: string,
  status: "approved" | "changes_requested",
  note?: string
) {
  const service = createServiceClient();

  // Validate the token matches this approval's project
  const { data: approval } = await service
    .from("approvals")
    .select("project_id")
    .eq("id", approvalId)
    .single();

  if (!approval) return { error: "Not found" };

  const { data: project } = await service
    .from("projects")
    .select("id")
    .eq("id", approval.project_id)
    .eq("share_token", shareToken)
    .single();

  if (!project) return { error: "Invalid link" };

  const { error } = await service
    .from("approvals")
    .update({ status, client_note: note ?? null })
    .eq("id", approvalId);

  return { error: error?.message ?? null };
}

// Freelancer revises and resubmits — resets to pending and clears client note
export async function reviseApproval(
  approvalId: string,
  title: string,
  description: string
) {
  const service = createServiceClient();

  const { error } = await service
    .from("approvals")
    .update({ title, description, status: "pending", client_note: null })
    .eq("id", approvalId);

  return { error: error?.message ?? null };
}

export async function deleteApproval(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("approvals")
    .delete()
    .eq("id", id);

  return { error: error?.message ?? null };
}
