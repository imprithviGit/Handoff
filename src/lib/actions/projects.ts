"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import type { ProjectStatus } from "@/lib/supabase/types";

async function getOwnerId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getProjects() {
  const supabase = createServiceClient();
  const ownerId = await getOwnerId();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", ownerId)
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error) { console.error("Projects error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
}

export async function getProject(id: string) {
  const supabase = createServiceClient();
  const ownerId = await getOwnerId();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .single();

  if (error) { console.error("Projects error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
}

export async function createProject(values: {
  name: string;
  client_name?: string;
  client_email?: string;
  deadline?: string;
  amount?: number;
  description?: string;
  is_contract?: boolean;
}) {
  if (!values.name?.trim()) return { data: null, error: "Project name is required." };
  if (!values.is_contract && !values.deadline) return { data: null, error: "Deadline is required for fixed projects." };
  if (values.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.client_email)) return { data: null, error: "Invalid client email address." };
  if (values.amount !== undefined && (isNaN(values.amount) || values.amount <= 0)) return { data: null, error: "Amount must be a positive number." };

  const supabase = createServiceClient();
  const ownerId = await getOwnerId();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...values, owner_id: ownerId })
    .select()
    .single();

  if (!error) {
    // Record trial start once — ON CONFLICT DO NOTHING so it's never overwritten
    // This prevents users from resetting their trial by deleting + recreating projects
    await supabase
      .from("customers")
      .upsert(
        { owner_id: ownerId, plan: "free", trial_started_at: new Date().toISOString() },
        { onConflict: "owner_id", ignoreDuplicates: true }
      );
  }

  revalidatePath("/dashboard");
  if (error) { console.error("Projects error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
}

export async function updateProject(id: string, values: {
  name?: string;
  client_name?: string;
  client_email?: string;
  status?: ProjectStatus;
  deadline?: string;
  amount?: number;
  description?: string;
}) {
  const supabase = createServiceClient();
  const ownerId = await getOwnerId();
  const { error } = await supabase
    .from("projects")
    .update(values)
    .eq("id", id)
    .eq("owner_id", ownerId);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/project/${id}`);
  if (error) { console.error("Projects error:", error); return { error: "Something went wrong. Please try again." }; } return { error: null };
}

export async function deleteProject(id: string) {
  const supabase = createServiceClient();
  const ownerId = await getOwnerId();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  revalidatePath("/dashboard");
  if (error) { console.error("Projects error:", error); return { error: "Something went wrong. Please try again." }; } return { error: null };
}

export async function resetShareToken(id: string) {
  const supabase = createServiceClient();
  const ownerId = await getOwnerId();
  const { data: tokenRow } = await supabase.rpc("generate_share_token" as never);
  const newToken = tokenRow as string;

  const { data, error } = await supabase
    .from("projects")
    .update({ share_token: newToken } as never)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("share_token")
    .single();

  if (error) { console.error("Projects error:", error); return { data: null, error: "Something went wrong. Please try again." }; } return { data, error: null };
}
