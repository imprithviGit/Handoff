"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-geist), sans-serif" }}>

      {/* Step 1 — Welcome + Video */}
      {step === 1 && (
        <div className="flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
            <span className="text-lg font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              Hand<span className="text-emerald-500">off</span>
            </span>
            <div className="flex items-center gap-2">
              {[1,2,3].map((n) => (
                <div key={n} className={`h-1 rounded-full transition-all ${n === 1 ? "w-8 bg-gray-900" : "w-4 bg-gray-200"}`} />
              ))}
            </div>
          </div>

          {/* Content */}
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

            {/* Video — large */}
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

            <button
              onClick={() => setStep(2)}
              className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-10 py-3 rounded-xl transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — How it works */}
      {step === 2 && (
        <div className="flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
            <span className="text-lg font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              Hand<span className="text-emerald-500">off</span>
            </span>
            <div className="flex items-center gap-2">
              {[1,2,3].map((n) => (
                <div key={n} className={`h-1 rounded-full transition-all ${n <= 2 ? "w-8 bg-gray-900" : "w-4 bg-gray-200"}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 max-w-2xl mx-auto w-full">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
                Three steps. That's all.
              </h2>
            </div>

            <div className="w-full space-y-3 mb-10">
              {[
                {
                  n: "01",
                  title: "Create a project",
                  desc: "Name it, add your client's details, set a deadline. Under 60 seconds.",
                },
                {
                  n: "02",
                  title: "Share one link",
                  desc: "Every project gets a unique URL. Send it once — your client sees everything inside.",
                },
                {
                  n: "03",
                  title: "Post updates & get approvals",
                  desc: "Keep clients in the loop. They approve files right inside the portal. Documented.",
                },
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

      {/* Step 3 — Ready */}
      {step === 3 && (
        <div className="flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
            <span className="text-lg font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              Hand<span className="text-emerald-500">off</span>
            </span>
            <div className="flex items-center gap-2">
              {[1,2,3].map((n) => (
                <div key={n} className="h-1 w-8 rounded-full bg-gray-900" />
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 max-w-lg mx-auto w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              You're all set.
            </h2>
            <p className="text-sm text-gray-400 mb-3 leading-relaxed">
              Your 14-day free trial is active. Full access to everything — no credit card needed.
            </p>

            <div className="flex items-center gap-2 mb-10 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[12px] font-semibold text-emerald-700">14-day free trial active</p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors mb-3"
            >
              Create my first project →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
