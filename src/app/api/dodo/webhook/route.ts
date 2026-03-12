import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { upsertCustomer } from "@/lib/actions/billing";
import type { Plan } from "@/lib/actions/billing";

function getDodo() {
  return new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: "test_mode",
  });
}

function planFromProductId(productId: string): Plan {
  if (productId === process.env.DODO_LIFETIME_PRODUCT_ID)    return "lifetime";
  if (productId === process.env.DODO_PRO_MONTHLY_PRODUCT_ID) return "pro";
  if (productId === process.env.DODO_PRO_ANNUAL_PRODUCT_ID)  return "pro";
  return "free";
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

  console.log("Dodo webhook:", type);

  try {
    if (type === "payment.succeeded") {
      const customerId     = data.customer?.customer_id as string ?? data.customer_id as string;
      const subscriptionId = data.subscription_id as string | null ?? null;
      const plan: Plan     = subscriptionId ? "pro" : "lifetime";
      await upsertCustomer({
        dodo_customer_id:     customerId,
        dodo_subscription_id: subscriptionId ?? undefined,
        plan,
        plan_period_end: null,
      });
    }

    if (type === "subscription.active") {
      const productId      = data.product_id as string;
      const customerId     = data.customer?.customer_id as string ?? data.customer_id as string;
      const subscriptionId = data.subscription_id as string;
      const periodEnd      = data.next_billing_date as string | null ?? null;
      await upsertCustomer({
        dodo_customer_id:     customerId,
        dodo_subscription_id: subscriptionId,
        plan:                 planFromProductId(productId),
        plan_period_end:      periodEnd,
      });
    }

    if (type === "subscription.renewed") {
      const productId      = data.product_id as string;
      const customerId     = data.customer?.customer_id as string ?? data.customer_id as string;
      const subscriptionId = data.subscription_id as string;
      const periodEnd      = data.next_billing_date as string | null ?? null;
      await upsertCustomer({
        dodo_customer_id:     customerId,
        dodo_subscription_id: subscriptionId,
        plan:                 planFromProductId(productId),
        plan_period_end:      periodEnd,
      });
    }

    if (type === "subscription.cancelled" || type === "refund.succeeded") {
      const customerId = data.customer?.customer_id as string ?? data.customer_id as string ?? null;
      await upsertCustomer({ dodo_customer_id: customerId ?? undefined, plan: "free", plan_period_end: null });
    }
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
