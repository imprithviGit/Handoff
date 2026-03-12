"use server";

import { createServiceClient } from "@/lib/supabase/server";

const OWNER_ID = "00000000-0000-0000-0000-000000000001";

export type Plan = "free" | "pro" | "lifetime";

export async function getCustomerPlan(): Promise<Plan> {
  const service = createServiceClient();
  const { data } = await service
    .from("customers")
    .select("plan")
    .eq("owner_id", OWNER_ID)
    .single();
  return (data?.plan as Plan) ?? "free";
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
