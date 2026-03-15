import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "No webhook secret" }, { status: 500 });

  const svixInstance = new Webhook(webhookSecret);
  const body = await req.text();
  const headers = {
    "svix-id":        req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: { type: string; data: { email_addresses: { email_address: string }[]; first_name?: string } };
  try {
    event = svixInstance.verify(body, headers) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ ok: true });
  }

  const email = event.data.email_addresses?.[0]?.email_address;
  const firstName = event.data.first_name ?? "there";
  if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Handoff <hello@gethandoff.co>",
    to: email,
    subject: "Welcome to Handoff 👋",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 28px;">
          <img src="https://gethandoff.co/handoff-logo.png" alt="Handoff" width="36" height="36" style="border-radius: 8px;" />
          <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #111827;">Hand<span style="color: #10b981;">off</span></span>
        </div>
        <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px;">Hey ${firstName}, welcome!</h1>
        <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
          You're all set. Create your first project and share one link with your client — no more chasing feedback over email.
        </p>
        <a href="https://gethandoff.co/dashboard" style="display: inline-block; background: #10b981; color: #000; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
          Create my first project →
        </a>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 32px; line-height: 1.6;">
          Your 14-day free trial is active — no credit card needed.<br/>
          Questions? Reply to this email or reach us at <a href="mailto:hello@gethandoff.co" style="color: #10b981;">hello@gethandoff.co</a>. We reply within 24 hrs.
        </p>
        <p style="font-size: 12px; color: #d1d5db; margin-top: 24px;">Handoff — Client portals for freelancers · <a href="https://gethandoff.co" style="color: #d1d5db;">gethandoff.co</a></p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
