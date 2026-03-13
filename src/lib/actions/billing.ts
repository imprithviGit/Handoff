"use server";

import { createServiceClient } from "@/lib/supabase/server";

const OWNER_ID = "00000000-0000-0000-0000-000000000001";

export type Plan = "free" | "pro" | "lifetime";

export type AccessStatus =
  | { status: "trial";    daysLeft: number }
  | { status: "active" }   // paid plan
  | { status: "expired" }; // trial over, no paid plan

export async function getCustomerPlan(): Promise<Plan> {
  const service = createServiceClient();
  const { data } = await service
    .from("customers")
    .select("plan")
    .eq("owner_id", OWNER_ID)
    .single();
  return (data?.plan as Plan) ?? "free";
}

export async function getAccessStatus(): Promise<AccessStatus> {
  const service = createServiceClient();

  // Check if paid plan exists
  const { data: customer } = await service
    .from("customers")
    .select("plan, plan_period_end")
    .eq("owner_id", OWNER_ID)
    .single();

  if (customer?.plan === "pro" || customer?.plan === "lifetime") {
    return { status: "active" };
  }

  // Check trial — based on first project creation date
  const { data: firstProject } = await service
    .from("projects")
    .select("created_at")
    .eq("owner_id", OWNER_ID)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!firstProject) {
    // No projects yet — full access (hasn't started trial)
    return { status: "trial", daysLeft: 14 };
  }

  const trialStart = new Date(firstProject.created_at);
  const now        = new Date();
  const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft   = 14 - daysPassed;

  if (daysLeft > 0) return { status: "trial", daysLeft };
  return { status: "expired" };
}

export async function upsertCustomer(fields: {
  dodo_customer_id?: string;
  dodo_subscription_id?: string;
  plan: Plan;
  plan_period_end?: string | null;
}) {
  const service = createServiceClient();
  const { error } = await service
    .from("customers")
    .upsert({ owner_id: OWNER_ID, ...fields }, { onConflict: "owner_id" });
  return { error: error?.message ?? null };
}
