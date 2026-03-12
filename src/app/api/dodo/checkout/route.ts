import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";

const PRODUCT_MAP: Record<string, string | undefined> = {
  pro_monthly: process.env.DODO_PRO_MONTHLY_PRODUCT_ID,
  pro_annual:  process.env.DODO_PRO_ANNUAL_PRODUCT_ID,
  lifetime:    process.env.DODO_LIFETIME_PRODUCT_ID,
};

export async function POST(req: NextRequest) {
  const { plan } = await req.json();

  const productId = PRODUCT_MAP[plan];
  if (!productId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "https://handoff-eight.vercel.app";

  try {
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY!,
      environment: "test_mode",
    });

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: `${origin}/dashboard?upgraded=true`,
    });

    const url = session.checkout_url;
    if (!url) throw new Error("No checkout URL returned");

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Dodo checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
