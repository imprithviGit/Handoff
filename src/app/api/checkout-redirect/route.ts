import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import DodoPayments from "dodopayments";

const PRODUCT_MAP: Record<string, string | undefined> = {
  pro_monthly: process.env.DODO_PRO_MONTHLY_PRODUCT_ID,
  pro_annual:  process.env.DODO_PRO_ANNUAL_PRODUCT_ID,
  lifetime:    process.env.DODO_LIFETIME_PRODUCT_ID,
};

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const plan = req.nextUrl.searchParams.get("plan") ?? "";
  const productId = PRODUCT_MAP[plan];
  if (!productId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  try {
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY!,
      environment: "live_mode",
    });

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: "https://www.gethandoff.co/dashboard?upgraded=true",
    });

    const url = session.checkout_url;
    if (!url) throw new Error("No checkout URL");

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
