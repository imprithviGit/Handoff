"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectStatus } from "@/lib/supabase/types";

// Hardcoded owner until real auth is wired up
const OWNER_ID = "00000000-0000-0000-0000-000000000001";

export async function getProjects() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .order("deadline", { ascending: true, nullsFirst: false });

  return { data, error: error?.message ?? null };
}

export async function getProject(id: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", OWNER_ID)
    .single();

  return { data, error: error?.message ?? null };
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
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...values, owner_id: OWNER_ID })
    .select()
    .single();

  revalidatePath("/dashboard");
  return { data, error: error?.message ?? null };
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
  const { error } = await supabase
    .from("projects")
    .update(values)
    .eq("id", id)
    .eq("owner_id", OWNER_ID);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/project/${id}`);
  return { error: error?.message ?? null };
}

export async function deleteProject(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", OWNER_ID);

  revalidatePath("/dashboard");
  return { error: error?.message ?? null };
}

export async function resetShareToken(id: string) {
  const supabase = createServiceClient();
  const { data: tokenRow } = await supabase.rpc("generate_share_token" as never);
  const newToken = tokenRow as string;

  const { data, error } = await supabase
    .from("projects")
    .update({ share_token: newToken } as never)
    .eq("id", id)
    .eq("owner_id", OWNER_ID)
    .select("share_token")
    .single();

  return { data, error: error?.message ?? null };
}
