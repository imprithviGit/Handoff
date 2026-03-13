"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export type Plan = "free" | "pro" | "lifetime";

export type AccessStatus =
  | { status: "trial";    daysLeft: number }
  | { status: "active" }   // paid plan
  | { status: "expired" }; // trial over, no paid plan

export async function getCustomerPlan(): Promise<Plan> {
  const { userId } = await auth();
  if (!userId) return "free";
  const service = createServiceClient();
  const { data } = await service
    .from("customers")
    .select("plan")
    .eq("owner_id", userId)
    .single();
  return (data?.plan as Plan) ?? "free";
}

export async function getAccessStatus(): Promise<AccessStatus> {
  const { userId } = await auth();
  if (!userId) return { status: "expired" };

  const service = createServiceClient();

  // Check if paid plan exists
  const { data: customer } = await service
    .from("customers")
    .select("plan, plan_period_end")
    .eq("owner_id", userId)
    .single();

  if (customer?.plan === "pro" || customer?.plan === "lifetime") {
    return { status: "active" };
  }

  // Check trial — based on first project creation date
  const { data: firstProject } = await service
    .from("projects")
    .select("created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!firstProject) {
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
  owner_id?: string;
  dodo_customer_id?: string;
  dodo_subscription_id?: string;
  plan: Plan;
  plan_period_end?: string | null;
}) {
  const owner_id = fields.owner_id ?? process.env.ADMIN_USER_ID;
  if (!owner_id) return { error: "No owner_id" };
  const service = createServiceClient();
  const { error } = await service
    .from("customers")
    .upsert({ ...fields, owner_id }, { onConflict: "owner_id" });
  return { error: error?.message ?? null };
}
