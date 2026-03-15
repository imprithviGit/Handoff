import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.gethandoff.co";

function checkoutLink(plan: string) {
  return `${BASE_URL}/api/checkout-redirect?plan=${plan}`;
}

function pricingButtons() {
  return `
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="padding-bottom: 10px;">
          <a href="${checkoutLink("pro_annual")}" style="display: block; background: #10b981; color: #000; font-weight: 700; font-size: 14px; padding: 13px 24px; border-radius: 10px; text-decoration: none; text-align: center;">
            Get Pro — $8/mo (Annual) →
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 10px;">
          <a href="${checkoutLink("pro_monthly")}" style="display: block; background: #f9fafb; border: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 14px; padding: 13px 24px; border-radius: 10px; text-decoration: none; text-align: center;">
            Monthly — $11/mo
          </a>
        </td>
      </tr>
      <tr>
        <td>
          <a href="${checkoutLink("lifetime")}" style="display: block; background: #030712; color: #34d399; font-weight: 700; font-size: 14px; padding: 13px 24px; border-radius: 10px; text-decoration: none; text-align: center;">
            Lifetime access — $179 (one-time)
          </a>
        </td>
      </tr>
    </table>
  `;
}

function buildEmail(firstName: string, subject: "3days" | "today") {
  const is3days = subject === "3days";
  const headline = is3days
    ? `Hey ${firstName}, your free trial ends in 3 days`
    : `Hey ${firstName}, today is the last day of your trial`;
  const body = is3days
    ? `You've had 11 days to explore Handoff — hope it's been useful. To keep your projects, client portals, and files accessible, upgrade before your trial ends on <strong>day 14</strong>.`
    : `Your 14-day free trial ends today. After today you'll lose access to creating new projects and sharing client portals. Upgrade now to keep everything running smoothly.`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #111827;">
      <div style="display: flex; align-items: center; margin-bottom: 28px;">
        <img src="${BASE_URL}/handoff-logo.png" alt="Handoff" width="36" height="36" style="border-radius: 8px; margin-right: 10px;" />
        <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #111827;">Hand<span style="color: #10b981;">off</span></span>
      </div>
      <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 12px;">${headline}</h1>
      <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 28px;">${body}</p>
      ${pricingButtons()}
      <p style="font-size: 13px; color: #9ca3af; margin-top: 28px; line-height: 1.6;">
        Questions? Reply to this email — we reply within 24 hrs.<br/>
        <a href="mailto:hello@gethandoff.co" style="color: #10b981;">hello@gethandoff.co</a>
      </p>
      <p style="font-size: 12px; color: #d1d5db; margin-top: 24px;">Handoff — Client portals for freelancers · <a href="${BASE_URL}" style="color: #d1d5db;">gethandoff.co</a></p>
    </div>
  `;
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { clerkClient } = await import("@clerk/nextjs/server");
  const clerk = await clerkClient();

  const now = new Date();

  // Users who started trial 11 days ago (±12h window) and haven't got reminder 1 yet
  const day11Start = new Date(now.getTime() - 11.5 * 24 * 60 * 60 * 1000).toISOString();
  const day11End   = new Date(now.getTime() - 10.5 * 24 * 60 * 60 * 1000).toISOString();

  // Users who started trial 14 days ago (±12h window) and haven't got reminder 2 yet
  const day14Start = new Date(now.getTime() - 14.5 * 24 * 60 * 60 * 1000).toISOString();
  const day14End   = new Date(now.getTime() - 13.5 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: remind3day }, { data: remindToday }] = await Promise.all([
    supabase
      .from("customers")
      .select("owner_id")
      .eq("plan", "free")
      .eq("trial_reminder_sent", 0)
      .gte("trial_started_at", day11Start)
      .lte("trial_started_at", day11End),
    supabase
      .from("customers")
      .select("owner_id")
      .eq("plan", "free")
      .lt("trial_reminder_sent", 2)
      .gte("trial_started_at", day14Start)
      .lte("trial_started_at", day14End),
  ]);

  let sent = 0;

  async function sendReminder(
    ownerId: string,
    type: "3days" | "today",
    newLevel: number
  ) {
    try {
      const user = await clerk.users.getUser(ownerId);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) return;
      const firstName = user.firstName ?? "there";

      await resend.emails.send({
        from: "Handoff <hello@gethandoff.co>",
        to: email,
        subject: type === "3days"
          ? "Your Handoff trial ends in 3 days"
          : "Last day of your Handoff trial",
        html: buildEmail(firstName, type),
      });

      await supabase
        .from("customers")
        .update({ trial_reminder_sent: newLevel } as never)
        .eq("owner_id", ownerId);

      sent++;
    } catch {
      // non-blocking
    }
  }

  const tasks = [
    ...(remind3day ?? []).map((r) => sendReminder(r.owner_id, "3days", 1)),
    ...(remindToday ?? []).map((r) => sendReminder(r.owner_id, "today", 2)),
  ];

  await Promise.all(tasks);

  return NextResponse.json({ ok: true, sent });
}
