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
    .select("plan, plan_period_end, trial_started_at")
    .eq("owner_id", userId)
    .single();

  if (customer?.plan === "pro" || customer?.plan === "lifetime") {
    return { status: "active" };
  }

  // Check trial — based on trial_started_at recorded on first project creation (immutable)
  const trialStartDate = customer?.trial_started_at as string | null | undefined;

  if (!trialStartDate) {
    return { status: "trial", daysLeft: 14 };
  }

  const trialStart = new Date(trialStartDate);
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
  if (error) { console.error("Billing error:", error); return { error: "Something went wrong. Please try again." }; } return { error: null };
}
