"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: 1,
    label: "Welcome",
  },
  {
    id: 2,
    label: "How it works",
  },
  {
    id: 3,
    label: "You're ready",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Logo */}
      <div className="mb-8">
        <span className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          Hand<span className="text-emerald-500">off</span>
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              step === s.id ? "bg-emerald-500 text-black" :
              step > s.id  ? "bg-emerald-100 text-emerald-700" :
                             "bg-gray-100 text-gray-400"
            }`}>
              {step > s.id ? "✓" : s.id}
            </div>
            {i < steps.length - 1 && <div className={`w-10 h-px ${step > s.id ? "bg-emerald-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Welcome + video */}
      {step === 1 && (
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Welcome to Handoff</h1>
            <p className="text-[13px] text-gray-400 mb-6 max-w-sm mx-auto">
              You're 30 seconds away from sharing your first professional client portal. Watch how it works.
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200 mb-6">
              <video
                src="/handoff-intro.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full block"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — How it works */}
      {step === 2 && (
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-1 text-center">Here's how it works</h2>
            <p className="text-[13px] text-gray-400 text-center mb-7">Three steps. That's all.</p>

            <div className="space-y-4 mb-8">
              {[
                {
                  n: "01",
                  title: "Create a project",
                  desc: "Name it, add your client's details, set a deadline. Done in under 60 seconds.",
                  icon: "◈",
                },
                {
                  n: "02",
                  title: "Share one link",
                  desc: "Every project gets a unique URL. Send it to your client — no login, no app required.",
                  icon: "↗",
                },
                {
                  n: "03",
                  title: "Post updates, get approvals",
                  desc: "Keep your client in the loop. They approve files right inside the portal.",
                  icon: "✦",
                },
              ].map((item) => (
                <div key={item.n} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shrink-0">
                    {item.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="cursor-pointer flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Ready */}
      {step === 3 && (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-3 max-w-xs mx-auto">
              Your 14-day free trial starts now. Full access to everything — no credit card needed.
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-7 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[12px] font-semibold text-emerald-700">14-day free trial active</p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
              >
                Create my first project →
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer w-full py-2.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
