"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

const features = [
  { icon: "↗", title: "One shareable link", description: "Share a single URL. Clients see updates, files, and approvals — no login needed.", tag: "Core" },
  { icon: "⌗", title: "Organised file delivery", description: "Upload deliverables directly. Versioned, labelled, always findable.", tag: "Files" },
  { icon: "◎", title: "Project timeline", description: "Post updates as you work. Clients get notified and stop chasing you.", tag: "Updates" },
  { icon: "✦", title: "File approvals", description: "Clients approve or request revisions right inside the portal. Documented.", tag: "Workflow" },
  { icon: "◈", title: "Custom branding", description: "Add your logo and colours. Clients see your brand — not ours.", tag: "Pro" },
  { icon: "◷", title: "Share via any medium", description: "Copy your portal link and share it over email, Slack, LinkedIn — wherever you work.", tag: "Core" },
];

const steps = [
  { n: "01", title: "Create a project", description: "Set up in under 60 seconds." },
  { n: "02", title: "Share the link", description: "One URL. Everything inside." },
  { n: "03", title: "Post updates & files", description: "Upload and post as you work." },
  { n: "04", title: "Close the loop", description: "Client approves. You move on." },
];


async function startCheckout(plan: string) {
  const res = await fetch("/api/dodo/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else alert("Something went wrong. Please try again.");
}

export default function Home() {
  const [pricingTab, setPricingTab] = useState<"monthly" | "annual" | "lifetime">("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  async function handleCheckout(plan: string) {
    setLoadingPlan(plan);
    await startCheckout(plan);
    setLoadingPlan(null);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-10 h-16">
          <a href="/" className="cursor-pointer shrink-0 flex items-center gap-2">
            <img src="/handoff-logo.png" alt="Handoff" className="w-7 h-7 rounded-lg" />
            <span className="text-xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Hand<span className="text-emerald-500">off</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8 flex-1">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">Pricing</a>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {isSignedIn ? (
              <a href="/dashboard" className="cursor-pointer text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-full transition-colors">
                Go to Dashboard →
              </a>
            ) : (
              <>
                <a href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer px-3 py-2">Log in</a>
                <a href="/signup" className="cursor-pointer text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-full transition-colors">
                  Get started free ↗
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-8 pt-16 pb-8 flex flex-col items-center text-center min-h-[80vh] justify-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-emerald-700 mb-7 cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          30-second setup · 3× cheaper than HoneyBook
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.15] tracking-tight mb-5 text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          Manage clients like
          <br />a <span className="text-emerald-500">pro freelancer.</span>
          <br />
          <span className="text-gray-400 font-extrabold">Not through <span className="line-through decoration-red-400">email threads.</span></span>
        </h1>

        <p className="text-base text-gray-500 max-w-lg mb-8 leading-relaxed">
          Set up in 30 seconds. Share one clean link. Your client sees updates, files, and approvals — no login, no app, no chasing. Half the price of every alternative.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <a href="/signup" className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-7 py-3.5 rounded-full transition-colors shadow-md shadow-emerald-100">
            Start for free ↗
          </a>
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">2,400+</p>
            <p className="text-xs text-gray-400 mt-0.5">Freelancers signed up</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">18k+</p>
            <p className="text-xs text-gray-400 mt-0.5">Client portals created</p>
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/80 bg-gray-100">
          <video
            src="/handoff-intro.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full block"
          />
        </div>
        <div className="mt-5 text-center">
          <p className="text-lg font-bold text-gray-900">That's it. Seriously.</p>
          <p className="text-sm text-gray-400 mt-1">30 seconds to set up. Your client gets a link. Everyone stays on the same page.</p>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="border-y border-gray-100 bg-gray-50/60 py-5">
        <div className="max-w-5xl mx-auto px-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Trusted by freelancers all over the world</p>
        </div>
      </section>

      {/* ── CHAOS SECTION ── */}
      <section className="bg-gray-50 py-24 px-8 overflow-hidden relative border-y border-gray-100">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-300/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Before Handoff</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              Sound familiar?
            </h2>
            <p className="text-gray-400 text-base max-w-md mx-auto">Your clients are everywhere. Your replies are scattered. Your sanity is suffering.</p>
          </div>

          {/* Floating bubbles — desktop */}
          <div className="relative hidden md:block h-[400px] mb-14">
            {/* Email bubble — top left */}
            <div style={{ animationDelay: "0s" }} className="absolute top-0 left-[2%] rotate-[-3deg] max-w-[230px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm">✉️</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">Email</p>
                  <p className="text-[10px] text-black/60">Re: Re: Re: Project files</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Did you check your email? I sent you something 3 days ago..."</p>
            </div>

            {/* Slack bubble — top center-left */}
            <div style={{ animationDelay: "0.25s" }} className="absolute top-6 left-[30%] rotate-[2deg] max-w-[220px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-sm">💬</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">Slack</p>
                  <p className="text-[10px] text-black/60">#general</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Did you see the Slack messages I sent this morning?"</p>
            </div>

            {/* Google Drive bubble — top right */}
            <div style={{ animationDelay: "0.5s" }} className="absolute top-2 right-[4%] rotate-[3deg] max-w-[235px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm">📂</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">Google Drive</p>
                  <p className="text-[10px] text-black/60">Shared with you</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Have you gone through the Google Drive links I shared?"</p>
            </div>

            {/* LinkedIn bubble — middle left */}
            <div style={{ animationDelay: "0.75s" }} className="absolute top-[42%] left-[8%] rotate-[-2deg] max-w-[210px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sm">💼</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">LinkedIn</p>
                  <p className="text-[10px] text-black/60">New message</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Where is the latest file? Can't find it anywhere."</p>
            </div>

            {/* Notion bubble — middle right */}
            <div style={{ animationDelay: "1s" }} className="absolute top-[38%] right-[6%] rotate-[1.5deg] max-w-[225px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm">📝</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">Notion</p>
                  <p className="text-[10px] text-black/60">Comment on page</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Did you see my feedback on the Notion doc?"</p>
            </div>

            {/* Messages bubble — bottom left */}
            <div style={{ animationDelay: "1.25s" }} className="absolute bottom-4 left-[20%] rotate-[-1.5deg] max-w-[215px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-sm">📱</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">Messages</p>
                  <p className="text-[10px] text-black/60">iMessage</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Just following up — did you get my last message?"</p>
            </div>

            {/* Email thread bubble — bottom right */}
            <div style={{ animationDelay: "1.5s" }} className="absolute bottom-2 right-[15%] rotate-[2.5deg] max-w-[230px] bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-110 transition-transform duration-200 cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-sm">🔔</div>
                <div>
                  <p className="text-[11px] font-semibold text-black">Email</p>
                  <p className="text-[10px] text-black/60">Re: Re: Re: Re: Update?</p>
                </div>
              </div>
              <p className="text-xs text-black/75 leading-relaxed">"Sorry to chase — just not sure if you got my feedback?"</p>
            </div>
          </div>

          {/* Floating bubbles — mobile grid fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden mb-10">
            {[
              { icon: "✉️", app: "Email", sub: "Re: Re: Re: Project files", msg: "\"Did you check your email? I sent you something 3 days ago...\"", color: "bg-blue-100", delay: "0s" },
              { icon: "💬", app: "Slack", sub: "#general", msg: "\"Did you see the Slack messages I sent this morning?\"", color: "bg-violet-100", delay: "0.2s" },
              { icon: "📂", app: "Google Drive", sub: "Shared with you", msg: "\"Have you gone through the Google Drive links I shared?\"", color: "bg-amber-100", delay: "0.4s" },
              { icon: "📱", app: "Messages", sub: "iMessage", msg: "\"Just following up — did you get my last message?\"", color: "bg-emerald-200", delay: "0.6s" },
              { icon: "📝", app: "Notion", sub: "Comment on page", msg: "\"Did you see my feedback on the Notion doc?\"", color: "bg-gray-200", delay: "0.8s" },
              { icon: "🔔", app: "Email", sub: "Re: Re: Re: Re: Update?", msg: "\"Sorry to chase — just not sure if you got my feedback?\"", color: "bg-pink-100", delay: "1s" },
            ].map((b, i) => (
              <div key={i} style={{ animationDelay: b.delay }} className="bg-emerald-500 border border-emerald-600 rounded-2xl p-3.5 shadow-lg shadow-emerald-400/40 animate-bounce hover:animate-none hover:scale-105 transition-transform duration-200 cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full ${b.color} flex items-center justify-center text-sm`}>{b.icon}</div>
                  <div>
                    <p className="text-[11px] font-semibold text-black">{b.app}</p>
                    <p className="text-[10px] text-black/60">{b.sub}</p>
                  </div>
                </div>
                <p className="text-xs text-black/75 leading-relaxed">{b.msg}</p>
              </div>
            ))}
          </div>

          {/* Transition arrow */}
          <div className="flex flex-col items-center gap-4 mb-14">
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50">
              Handoff fixes this ↓
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Clean portal mockup */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-100">
              {/* Portal header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Handoff</p>
                  <p className="text-base font-bold text-gray-900">Website Redesign — Acme Co.</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">In Progress</span>
              </div>

              {/* Update feed */}
              <div className="space-y-3 mb-5">
                {[
                  { emoji: "✅", text: "Homepage mockup v2 is ready — feedback requested", time: "2h ago", tag: "Update" },
                  { emoji: "📎", text: "Brand assets uploaded: logos, fonts, colour palette", time: "Yesterday", tag: "File" },
                  { emoji: "👍", text: "Client approved: Homepage direction confirmed", time: "2 days ago", tag: "Approved", approved: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                    <span className="text-base mt-0.5">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{item.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.approved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>{item.tag}</span>
                  </div>
                ))}
              </div>

              {/* Pending approval pill */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-sm">⏳</span>
                <p className="text-xs text-amber-700/80 flex-1">Awaiting approval: <span className="font-semibold text-amber-700">Navigation structure — please review</span></p>
                <button className="text-[11px] font-bold bg-amber-400 text-black px-3 py-1.5 rounded-lg shrink-0">Review</button>
              </div>
            </div>

            {/* Caption */}
            <p className="text-center text-gray-400 text-sm mt-6 font-medium">
              Everything in one place — updates, files, and approvals.
            </p>
          </div>
        </div>
      </section>

      {/* ── 30 SECONDS ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="bg-emerald-500 rounded-3xl p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Why freelancers love it</p>
            <h2 className="text-3xl font-extrabold text-black leading-tight mb-5" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              Share a project update<br />in 30 seconds flat.
            </h2>
            <p className="text-black/60 text-sm leading-relaxed mb-7">
              Type a quick update, attach a file if needed, hit send. Your client gets an email, opens the portal, and sees everything in one place. No thread to scroll. No link to search for. Done.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "⚡", text: "No forms, no dashboards to learn — just type and post" },
                { icon: "🔗", text: "Client gets the link once — it works forever" },
                { icon: "💸", text: "14-day free trial. Pro is $8/mo — less than your cheapest competitor" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-black/70">
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-950 rounded-2xl p-5 shadow-xl shadow-black/20">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Post an update</p>
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 mb-3">
              <p className="text-sm text-white/70 leading-relaxed">
                ✅ Logo v3 is ready! I've made the adjustments you requested — cleaner lines, updated font weight. File attached below. Let me know if this works!
              </p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-xs text-emerald-400">📎</span>
                <span className="text-xs text-emerald-400 font-medium">logo_v3_final.zip</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/25">Client will be notified by email</p>
              <button className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                Post update →
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-white/25">Takes about <span className="font-semibold text-white/60">30 seconds</span> to post</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-5">Without Handoff</p>
            {["Clients buried in email threads looking for files", "\"Did you send the latest version?\" — every single project", "5 Google Drive links, none of them the right one", "Clients chasing you because they feel left in the dark", "Looking disorganised when you're actually great"].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-500 mb-3">
                <span className="mt-1 text-red-300 shrink-0 font-bold">✕</span>
                {item}
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-5">With Handoff</p>
            {["One clean link — everything your client needs", "Files organised, versioned, always findable", "Updates posted once, client notified instantly", "Approvals documented inside the portal", "You look like a studio, not a solo freelancer"].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-700 mb-3">
                <span className="mt-1 text-emerald-500 shrink-0 font-bold">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-2xl font-bold text-gray-900">Everything in one place</h2>
            <p className="mt-2 text-gray-500 text-sm max-w-md">No bloat. No CRM. No learning curve. Just what you need.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-50 rounded-2xl p-6 transition-all duration-200 cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl text-gray-300">{f.icon}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${f.tag === "Pro" ? "text-amber-600 border-amber-200 bg-amber-50" : "text-emerald-700 border-emerald-200 bg-emerald-50"}`}>{f.tag}</span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-8 py-20">
        <div className="mb-12">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-2xl font-bold text-gray-900">Up and running in minutes</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shrink-0">{s.n}</div>
                {i < steps.length - 1 && <div className="hidden md:block flex-1 h-px bg-gray-200" />}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── PRICING ── */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fraction of what others charge</h2>
            <p className="text-sm text-gray-400">HoneyBook $19 · Dubsado $20 · Copilot $29. We're <span className="font-semibold text-emerald-600">$8/mo</span> — and built for exactly this. <span className="font-semibold text-gray-600">14-day free trial, no card needed.</span></p>
          </div>

          {/* Comparison grid */}
          <div className="grid grid-cols-4 gap-3 mb-16">
            {/* Competitor cards */}
            {[
              { name: "HoneyBook", price: "$19", label: "Full CRM suite" },
              { name: "Dubsado",   price: "$20", label: "Contracts & invoices" },
              { name: "Copilot",   price: "$29", label: "Agency-focused" },
            ].map((c, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-3">{c.name}</p>
                  <p className="text-2xl font-bold text-gray-300">{c.price}</p>
                  <p className="text-xs text-gray-300 mt-0.5">/month</p>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">{c.label}</p>
              </div>
            ))}

            {/* Handoff hero card */}
            <div className="relative bg-white border-2 border-emerald-400 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-emerald-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Built for freelancers
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-3">Handoff</p>
                <p className="text-2xl font-bold text-gray-900">$8</p>
                <p className="text-xs text-gray-400 mt-0.5">/month, billed annually</p>
              </div>
              <div className="mt-4 space-y-1.5">
                <p className="text-xs text-gray-500 leading-relaxed">Everything you need.</p>
                <p className="text-xs font-semibold text-emerald-600">3–4× cheaper than alternatives.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-16">
            <div className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">
              <button onClick={() => setPricingTab("monthly")} className={`cursor-pointer px-5 py-2 rounded-lg text-sm font-semibold transition-all ${pricingTab === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>Monthly</button>
              <button onClick={() => setPricingTab("annual")} className={`cursor-pointer px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${pricingTab === "annual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>
                Annual
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md">–27%</span>
              </button>
              <button onClick={() => setPricingTab("lifetime")} className={`cursor-pointer px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${pricingTab === "lifetime" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>
                Lifetime
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Limited offer</span>
              </button>
            </div>
          </div>

          {pricingTab !== "lifetime" && (
            <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-7">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Free trial</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">14 days</p>
                <p className="text-xs text-gray-400 mb-7">No credit card needed · Full access</p>
                <ul className="space-y-2.5 mb-8">
                  {["Unlimited projects during trial", "Shareable client portal", "File uploads & approvals", "Project update timeline", "All Pro features included"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="text-gray-300 font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className="cursor-pointer block text-center w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all">
                  Start free trial
                </a>
              </div>

              <div className="bg-emerald-500 border border-emerald-500 rounded-2xl p-7 relative text-black">
                <div className="absolute -top-3 left-6 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Most popular</div>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <p className="text-4xl font-extrabold">${pricingTab === "annual" ? "8" : "11"}</p>
                  <span className="text-black/40 text-sm mb-1">/mo</span>
                </div>
                <p className="text-xs text-black/50 mb-1">{pricingTab === "annual" ? "Billed annually — save $36/year" : "Billed monthly, cancel anytime"}</p>
                <p className="text-xs text-black/60 font-semibold mb-7">2.5× cheaper than alternatives</p>
                <ul className="space-y-2.5 mb-8">
                  {["Unlimited active projects", "Custom branding + logo", "Share via link — any medium", "File approvals & revisions", "1 GB file storage", "Priority support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-black/70">
                      <span className="text-black/50 font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(pricingTab === "annual" ? "pro_annual" : "pro_monthly")}
                  disabled={loadingPlan !== null}
                  className="cursor-pointer w-full py-3 rounded-xl bg-black text-emerald-400 font-bold text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {loadingPlan === "pro_annual" || loadingPlan === "pro_monthly" ? "Redirecting…" : "Get started →"}
                </button>
              </div>
            </div>
          )}

          {pricingTab === "lifetime" && (
            <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-7">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Free trial</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">14 days</p>
                <p className="text-xs text-gray-400 mb-7">No credit card needed · Full access</p>
                <ul className="space-y-2.5 mb-8">
                  {["Unlimited projects during trial", "Shareable client portal", "File uploads & approvals", "Project update timeline", "All Pro features included"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="text-gray-300 font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <a href="/signup" className="cursor-pointer block text-center w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all">
                  Start free trial
                </a>
              </div>

              <div className="bg-gray-950 border-2 border-emerald-500/40 rounded-2xl p-7 relative text-white">
                <div className="absolute -top-3 left-6 bg-emerald-400 text-black text-xs font-bold px-3 py-1 rounded-full">Limited time offer</div>
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-4">Lifetime</p>
                <div className="flex items-end gap-2 mb-1">
                  <p className="text-4xl font-extrabold text-white">$179</p>
                  <span className="text-white/20 line-through text-base mb-1">$216</span>
                </div>
                <p className="text-xs text-white/30 mb-1">One-time payment, yours forever</p>
                <p className="text-xs text-emerald-400 font-semibold mb-7">Pays for itself in 22 months · Save $37</p>
                <ul className="space-y-2.5 mb-8">
                  {["Everything in Pro", "Lifetime updates included", "No recurring fees, ever", "Lock in today's price", "Early access to new features", "Founding member badge"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-white/50">
                      <span className="text-emerald-400 font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout("lifetime")}
                  disabled={loadingPlan !== null}
                  className="cursor-pointer w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {loadingPlan === "lifetime" ? "Redirecting…" : "Get lifetime access →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
            Set up in 30 seconds.<br /><span className="text-emerald-400">Clients love it.</span>
          </h2>
          <p className="text-white/40 text-sm mb-7 max-w-sm mx-auto leading-relaxed">
            One clean link. Everything your client needs. Cheaper than HoneyBook, Dubsado, and Copilot — combined.
          </p>
          <a href="/signup" className="cursor-pointer inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 transition-colors text-black font-semibold text-sm px-8 py-3.5 rounded-full">
            Create your first project ↗
          </a>
          <p className="mt-4 text-xs text-white/20">14-day free trial. No credit card needed.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white px-8 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/handoff-logo.png" alt="Handoff" className="w-6 h-6 rounded-md" />
            <span className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Hand<span className="text-emerald-500">off</span></span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Handoff — Built for freelancers.</p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="cursor-pointer hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="cursor-pointer hover:text-gray-900 transition-colors">Terms</a>
            <a href="https://x.com/gethandoff" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:text-gray-900 transition-colors">X / Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
