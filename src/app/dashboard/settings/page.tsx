"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useAccess } from "@/lib/hooks/useAccess";
import { useState } from "react";

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

async function startCheckout(plan: string) {
  const res = await fetch("/api/dodo/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isActive, isTrial, isExpired, daysLeft } = useAccess();
  const [copied, setCopied]         = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName]       = useState("");
  const [profileCountry, setProfileCountry] = useState("");
  const [savingProfile, setSavingProfile]   = useState(false);

  function startEditProfile() {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    setProfileName(fullName);
    setProfileCountry((user?.unsafeMetadata?.country as string) ?? "");
    setEditingProfile(true);
  }

  async function saveProfile() {
    if (!profileName.trim()) return;
    setSavingProfile(true);
    const parts = profileName.trim().split(" ");
    const firstName = parts[0];
    const lastName  = parts.slice(1).join(" ") || undefined;
    await user?.update({ firstName, lastName, unsafeMetadata: { country: profileCountry } });
    setSavingProfile(false);
    setEditingProfile(false);
  }

  const referralUrl = "https://gethandoff.co";

  function copyReferral() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const planLabel = isActive ? "Pro" : isTrial ? `Free Trial (${daysLeft} days left)` : "Trial Expired";
  const planColor = isActive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : isTrial ? "text-blue-700 bg-blue-50 border-blue-200" : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-[0_1px_0_0_#f1f5f9]">
        <h1 className="text-[15px] font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          {isLoaded && <>Hey, <span className="text-emerald-500">{user?.firstName?.split(" ")[0]}</span></>}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8 space-y-5">

        {/* ── Profile ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900">Profile</h2>
            {!editingProfile && (
              <button
                onClick={startEditProfile}
                className="cursor-pointer text-[12px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3.5 py-1.5 rounded-lg transition-all"
              >
                Edit
              </button>
            )}
          </div>

          {!editingProfile ? (
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700 shrink-0">
                {(user?.firstName?.[0] ?? user?.emailAddresses[0]?.emailAddress?.[0] ?? "A").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.emailAddresses[0]?.emailAddress ?? "—"}</p>
                {typeof user?.unsafeMetadata?.country === "string" && (
                  <p className="text-xs text-gray-400 mt-0.5">{user.unsafeMetadata.country as string}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full name</label>
                <input
                  autoFocus
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveProfile()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Country</label>
                <select
                  value={profileCountry}
                  onChange={(e) => setProfileCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors bg-white cursor-pointer"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveProfile}
                  disabled={!profileName.trim() || savingProfile}
                  className="cursor-pointer bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="cursor-pointer text-[12px] font-medium text-gray-400 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Plan & Billing ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Plan & Billing</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Current plan</p>
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full border ${planColor}`}>
                  {planLabel}
                </span>
              </div>
              {!isActive && (
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Upgrade to keep full access</p>
                  <button
                    onClick={() => startCheckout("pro_annual")}
                    className="cursor-pointer text-[12px] font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg transition-colors"
                  >
                    Upgrade to Pro →
                  </button>
                </div>
              )}
            </div>

            {!isActive && (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => startCheckout("pro_monthly")}
                  className="cursor-pointer border border-gray-200 hover:border-emerald-300 rounded-xl p-4 text-left transition-all hover:shadow-sm group"
                >
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pro Monthly</p>
                  <p className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors">$11<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Billed monthly · Cancel anytime</p>
                </button>
                <button
                  onClick={() => startCheckout("pro_annual")}
                  className="cursor-pointer border border-gray-200 hover:border-emerald-300 rounded-xl p-4 text-left transition-all hover:shadow-sm group"
                >
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pro Annual</p>
                  <p className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors">$8<span className="text-sm font-normal text-gray-400">/mo</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Billed annually · Save $36/yr</p>
                </button>
                <button
                  onClick={() => startCheckout("lifetime")}
                  className="cursor-pointer border border-gray-200 hover:border-gray-900 rounded-xl p-4 text-left transition-all hover:shadow-sm bg-gray-950 group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Lifetime</p>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">Limited offer</span>
                  </div>
                  <p className="text-xl font-extrabold text-white">$179<span className="text-sm font-normal text-white/30"> once</span></p>
                  <p className="text-[11px] text-white/30 mt-0.5">Pay once, use forever</p>
                </button>
              </div>
            )}

            {isActive && (
              <p className="text-[12px] text-gray-400">You're on the Pro plan. Thank you for supporting Handoff 🙌</p>
            )}
          </div>
        </section>

        {/* ── Share with friends ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Share Handoff</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
              Know a freelancer drowning in email threads? Share Handoff with them — it takes 30 seconds to set up and makes you look like a pro.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-500 font-mono truncate">
                {referralUrl}
              </div>
              <button
                onClick={copyReferral}
                className={`cursor-pointer shrink-0 text-[12px] font-bold px-4 py-2 rounded-lg transition-colors ${copied ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-black"}`}
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={`https://twitter.com/intent/tweet?text=I've been using Handoff to share client portals instead of email threads. Clean, fast, professional. Check it out 👇&url=${referralUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex-1 text-center text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 px-3 py-2 rounded-lg transition-all"
              >
                Share on X →
              </a>
              <a
                href="https://x.com/gethandoff"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer shrink-0 text-center text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 px-3 py-2 rounded-lg transition-all"
              >
                @gethandoff
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${referralUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex-1 text-center text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 px-3 py-2 rounded-lg transition-all"
              >
                Share on LinkedIn →
              </a>
            </div>
          </div>
        </section>

        {/* ── Support ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Support</h2>
          </div>
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-gray-700">Need help?</p>
              <p className="text-[11px] text-gray-400 mt-0.5">We reply within 24 hours.</p>
            </div>
            <a
              href="mailto:hello@gethandoff.co"
              className="cursor-pointer shrink-0 text-[12px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg transition-colors"
            >
              hello@gethandoff.co
            </a>
          </div>
        </section>

        {/* ── Account ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Account</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-gray-700">Sign out</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Sign out of your account on this device</p>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: "/login" })}
                className="cursor-pointer text-[12px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3.5 py-2 rounded-lg transition-all"
              >
                Sign out
              </button>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-red-500">Delete account</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Permanently delete your account and all projects</p>
              </div>
              <button
                onClick={() => {
                  if (confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.")) {
                    user?.delete().then(() => window.location.href = "/");
                  }
                }}
                className="cursor-pointer text-[12px] font-semibold text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3.5 py-2 rounded-lg transition-all"
              >
                Delete account
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
