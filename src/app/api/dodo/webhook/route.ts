import { NextRequest, NextResponse } from "next/server";
import { upsertCustomer } from "@/lib/actions/billing";
import type { Plan } from "@/lib/actions/billing";
import { createHmac, timingSafeEqual } from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac("sha256", secret).update(payload).digest("hex");
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

function planFromProductId(productId: string): Plan {
  if (productId === process.env.DODO_LIFETIME_PRODUCT_ID) return "lifetime";
  if (
    productId === process.env.DODO_PRO_MONTHLY_PRODUCT_ID ||
    productId === process.env.DODO_PRO_ANNUAL_PRODUCT_ID
  ) return "pro";
  return "free";
}

export async function POST(req: NextRequest) {
  const payload   = await req.text();
  const signature = req.headers.get("webhook-signature") ?? req.headers.get("x-dodo-signature") ?? "";
  const secret    = process.env.DODO_WEBHOOK_SECRET!;

  if (!verifySignature(payload, signature, secret)) {
    console.error("Invalid Dodo webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type as string;
  const data = event.data as Record<string, unknown>;

  console.log("Dodo webhook:", type);

  if (type === "payment.succeeded") {
    const productId    = data.product_id as string;
    const customerId   = data.customer_id as string;
    const plan         = planFromProductId(productId);
    const periodEnd    = data.period_end as string | null ?? null;

    await upsertCustomer({
      dodo_customer_id: customerId,
      plan,
      plan_period_end: periodEnd,
    });
  }

  if (type === "subscription.active") {
    const productId      = data.product_id as string;
    const customerId     = data.customer_id as string;
    const subscriptionId = data.subscription_id as string;
    const periodEnd      = data.current_period_end as string | null ?? null;

    await upsertCustomer({
      dodo_customer_id:      customerId,
      dodo_subscription_id:  subscriptionId,
      plan:                  planFromProductId(productId),
      plan_period_end:       periodEnd,
    });
  }

  if (type === "subscription.renewed") {
    const periodEnd      = data.current_period_end as string | null ?? null;
    const subscriptionId = data.subscription_id as string;
    const customerId     = data.customer_id as string;
    const productId      = data.product_id as string;

    await upsertCustomer({
      dodo_customer_id:     customerId,
      dodo_subscription_id: subscriptionId,
      plan:                 planFromProductId(productId),
      plan_period_end:      periodEnd,
    });
  }

  if (type === "subscription.cancelled" || type === "refund.succeeded") {
    await upsertCustomer({ plan: "free", plan_period_end: null });
  }

  return NextResponse.json({ received: true });
}
