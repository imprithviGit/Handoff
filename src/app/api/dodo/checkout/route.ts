import { NextRequest, NextResponse } from "next/server";

const DODO_API_BASE = "https://test.dodo.ac/v1"; // switch to https://api.dodo.ac/v1 in production

const PRODUCT_MAP: Record<string, string> = {
  pro_monthly: process.env.DODO_PRO_MONTHLY_PRODUCT_ID!,
  pro_annual:  process.env.DODO_PRO_ANNUAL_PRODUCT_ID!,
  lifetime:    process.env.DODO_LIFETIME_PRODUCT_ID!,
};

export async function POST(req: NextRequest) {
  const { plan } = await req.json();

  const productId = PRODUCT_MAP[plan];
  if (!productId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "https://handoff-eight.vercel.app";

  const res = await fetch(`${DODO_API_BASE}/payment_links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
    },
    body: JSON.stringify({
      product_id:   productId,
      success_url:  `${origin}/dashboard?upgraded=true`,
      cancel_url:   `${origin}/#pricing`,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Dodo checkout error:", data);
    return NextResponse.json({ error: data?.message ?? "Checkout failed" }, { status: 500 });
  }

  return NextResponse.json({ url: data.url ?? data.payment_link ?? data.checkout_url });
}
