import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createServiceClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/actions/billing";

function getDodo() {
  return new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: "live_mode",
  });
}

function planFromProductId(productId: string): Plan {
  if (productId === process.env.DODO_LIFETIME_PRODUCT_ID)    return "lifetime";
  if (productId === process.env.DODO_PRO_MONTHLY_PRODUCT_ID) return "pro";
  if (productId === process.env.DODO_PRO_ANNUAL_PRODUCT_ID)  return "pro";
  return "free";
}

async function upgradePlan(fields: {
  owner_id: string;
  dodo_customer_id?: string;
  dodo_subscription_id?: string;
  plan: Plan;
  plan_period_end?: string | null;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("customers")
    .upsert(
      { ...fields },
      { onConflict: "owner_id" }
    );
  if (error) console.error("Webhook upsert error:", error);
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => { headers[key] = value; });

  const dodo = getDodo();
  let event: ReturnType<typeof dodo.webhooks.unsafeUnwrap>;
  try {
    event = dodo.webhooks.unwrap(payload, {
      headers,
      key: process.env.DODO_WEBHOOK_SECRET!,
    });
  } catch (err) {
    console.error("Dodo webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const type = event.type;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = event.data as Record<string, any>;

  console.log("Dodo webhook:", type, JSON.stringify(data).slice(0, 200));

  try {
    if (type === "payment.succeeded") {
      const owner_id        = data.metadata?.owner_id as string | undefined;
      const customerId      = data.customer?.customer_id as string ?? data.customer_id as string;
      const subscriptionId  = data.subscription_id as string | null ?? null;
      const plan: Plan      = subscriptionId ? "pro" : "lifetime";
      if (!owner_id) { console.error("Webhook: no owner_id in metadata"); return NextResponse.json({ received: true }); }
      await upgradePlan({ owner_id, dodo_customer_id: customerId, dodo_subscription_id: subscriptionId ?? undefined, plan, plan_period_end: null });
    }

    if (type === "subscription.active") {
      const owner_id        = data.metadata?.owner_id as string | undefined;
      const productId       = data.product_id as string;
      const customerId      = data.customer?.customer_id as string ?? data.customer_id as string;
      const subscriptionId  = data.subscription_id as string;
      const periodEnd       = data.next_billing_date as string | null ?? null;
      if (!owner_id) { console.error("Webhook: no owner_id in metadata"); return NextResponse.json({ received: true }); }
      await upgradePlan({ owner_id, dodo_customer_id: customerId, dodo_subscription_id: subscriptionId, plan: planFromProductId(productId), plan_period_end: periodEnd });
    }

    if (type === "subscription.renewed") {
      const owner_id        = data.metadata?.owner_id as string | undefined;
      const productId       = data.product_id as string;
      const customerId      = data.customer?.customer_id as string ?? data.customer_id as string;
      const subscriptionId  = data.subscription_id as string;
      const periodEnd       = data.next_billing_date as string | null ?? null;
      if (!owner_id) { console.error("Webhook: no owner_id in metadata"); return NextResponse.json({ received: true }); }
      await upgradePlan({ owner_id, dodo_customer_id: customerId, dodo_subscription_id: subscriptionId, plan: planFromProductId(productId), plan_period_end: periodEnd });
    }

    if (type === "subscription.cancelled" || type === "refund.succeeded") {
      const owner_id = data.metadata?.owner_id as string | undefined;
      if (!owner_id) { console.error("Webhook: no owner_id in metadata"); return NextResponse.json({ received: true }); }
      await upgradePlan({ owner_id, plan: "free", plan_period_end: null });
    }
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
