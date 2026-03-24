"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Netherlands", "Spain", "Italy", "Portugal",
  "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria",
  "Belgium", "Poland", "Czech Republic", "Romania", "Ukraine",
  "Brazil", "Mexico", "Argentina", "Colombia", "Chile",
  "Nigeria", "South Africa", "Kenya", "Ghana",
  "UAE", "Saudi Arabia", "Israel", "Turkey",
  "Singapore", "Malaysia", "Indonesia", "Philippines", "Thailand",
  "Japan", "South Korea", "China", "Hong Kong", "Taiwan",
  "New Zealand", "Pakistan", "Bangladesh", "Sri Lanka",
  "Other",
];

const TOTAL_STEPS = 4;

function TopBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-2">
        <img src="/handoff-logo.png" alt="Handoff" className="w-7 h-7 rounded-lg" />
        <span className="text-lg font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          Hand<span className="text-emerald-500">off</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${i < step ? "w-8 bg-gray-900" : "w-4 bg-gray-200"}`}
          />
        ))}
      </div>
    </div>
  );
}

async function startCheckout(plan: string) {
  const res = await fetch("/api/dodo/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName]       = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving]   = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Redirect away if onboarding already completed
  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.onboardingComplete === true) {
      router.replace("/dashboard");
    }
  }, [isLoaded, user, router]);

  async function markOnboardingComplete() {
    await user?.update({ unsafeMetadata: { ...user.unsafeMetadata, onboardingComplete: true } });
    router.push("/dashboard");
  }

  async function handleNameNext() {
    if (!name.trim() || !country) return;
    setSaving(true);
    const parts = name.trim().split(" ");
    const firstName = parts[0];
    const lastName  = parts.slice(1).join(" ") || "";
    await user?.update({ firstName, lastName, unsafeMetadata: { ...user?.unsafeMetadata, country } });
    setSaving(false);
    setStep(2);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Step 1 — Name + Country */}
      {step === 1 && (
        <div className="flex flex-col min-h-screen">
          <TopBar step={1} />
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Quick setup</p>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                What should we call you?
              </h1>
              <p className="text-sm text-gray-400 mt-2">This is how your clients will see you.</p>
            </div>

            <div className="w-full space-y-4 mb-8">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleNameNext}
              disabled={!name.trim() || !country || saving}
              className="cursor-pointer w-full py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {saving ? "Saving…" : "Continue →"}
            </button>
            <p className="text-center text-[12px] text-gray-400 mt-3">
              You can change this anytime in Settings.
            </p>
          </div>
        </div>
      )}

      {/* Step 2 — Welcome + Video */}
      {step === 2 && (
        <div className="flex flex-col min-h-screen">
          <TopBar step={2} />
          <div className="flex flex-1 flex-col items-center justify-start px-8 pt-10 pb-8 max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Welcome to Handoff</p>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Your client portal, in 30 seconds.
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                Watch how freelancers share professional project updates — no email threads, no chaos.
              </p>
            </div>

            <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-[0_8px_40px_rgba(0,0,0,0.10)] mb-8 bg-gray-100">
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

            <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
              <button
                onClick={() => setStep(1)}
                className="cursor-pointer px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="cursor-pointer flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — How it works */}
      {step === 3 && (
        <div className="flex flex-col min-h-screen">
          <TopBar step={3} />
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 max-w-2xl mx-auto w-full">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Three steps. That's all.
              </h2>
            </div>

            <div className="w-full space-y-3 mb-10">
              {[
                { n: "01", title: "Create a project", desc: "Name it, add your client's details, set a deadline. Under 60 seconds." },
                { n: "02", title: "Share one link", desc: "Every project gets a unique URL. Send it once — your client sees everything inside." },
                { n: "03", title: "Post updates & get approvals", desc: "Keep clients in the loop. They approve files right inside the portal. Documented." },
              ].map((item) => (
                <div key={item.n} className="flex items-start gap-5 p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
                  <span className="text-[11px] font-bold text-gray-300 mt-0.5 w-6 shrink-0">{item.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setStep(2)}
                className="cursor-pointer px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="cursor-pointer flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Pricing */}
      {step === 4 && (
        <div className="flex flex-col min-h-screen">
          <TopBar step={4} />
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 max-w-4xl mx-auto w-full">

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2 w-fit mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[12px] font-semibold text-emerald-700">14-day free trial active — no card needed</p>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                You're all set{name ? `, ${name.split(" ")[0]}` : ""}. Choose a plan.
              </h2>
              <p className="text-sm text-gray-400 mt-2">Start free. Upgrade anytime before your trial ends.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">

              {/* Monthly */}
              <div className="border border-gray-200 rounded-2xl p-5 flex flex-col">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Monthly</p>
                <div className="flex items-end gap-1 mb-0.5">
                  <p className="text-3xl font-extrabold text-gray-900">$11</p>
                  <span className="text-gray-400 text-sm mb-1">/mo</span>
                </div>
                <p className="text-xs text-gray-400 mb-5">Billed monthly, cancel anytime</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Unlimited projects", "Shareable client portal", "File uploads & approvals", "Priority support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout("pro_monthly")}
                  className="cursor-pointer w-full py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-900 text-sm font-semibold text-gray-700 transition-colors"
                >
                  Get started →
                </button>
              </div>

              {/* Annual */}
              <div className="relative bg-emerald-500 rounded-2xl p-5 flex flex-col text-black">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most popular
                </div>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Annual</p>
                <div className="flex items-end gap-1 mb-0.5">
                  <p className="text-3xl font-extrabold">$8</p>
                  <span className="text-black/40 text-sm mb-1">/mo</span>
                </div>
                <p className="text-xs text-black/50 mb-0.5">Billed annually — save $36/year</p>
                <p className="text-xs font-semibold text-black/70 mb-5">2.5× cheaper than alternatives</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Unlimited projects", "Shareable client portal", "File uploads & approvals", "Priority support"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-black/70">
                      <span className="text-black/50 font-bold shrink-0">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout("pro_annual")}
                  className="cursor-pointer w-full py-2.5 rounded-xl bg-black text-emerald-400 font-bold text-sm hover:bg-gray-900 transition-colors"
                >
                  Get started →
                </button>
              </div>

              {/* Lifetime */}
              <div className="relative bg-gray-950 border-2 border-emerald-500/30 rounded-2xl p-5 flex flex-col text-white">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-black text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Limited time offer
                </div>
                <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-4">Lifetime</p>
                <div className="flex items-end gap-2 mb-0.5">
                  <p className="text-3xl font-extrabold text-white">$179</p>
                  <span className="text-white/20 line-through text-sm mb-1">$216</span>
                </div>
                <p className="text-xs text-white/30 mb-0.5">One-time payment, yours forever</p>
                <p className="text-xs text-emerald-400 font-semibold mb-5">Pays for itself in 22 months</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {["Everything in Pro", "Lifetime updates included", "No recurring fees, ever", "Lock in today's price", "Founding member badge"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout("lifetime")}
                  className="cursor-pointer w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors"
                >
                  Get lifetime access →
                </button>
              </div>
            </div>

            <button
              onClick={markOnboardingComplete}
              className="cursor-pointer w-full max-w-sm py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-colors"
            >
              Continue with free trial — no card needed →
            </button>
            <p className="text-[11px] text-gray-400 mt-3">No data deleted · Cancel anytime · Secure payment via Dodo Payments</p>
          </div>
        </div>
      )}

    </div>
  );
}
