"use client";

async function startCheckout(plan: string) {
  const res = await fetch("/api/dodo/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

// Full-screen overlay — dismissible
export function PaywallOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl cursor-pointer"
        >
          ✕
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">⚡</span>
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your free trial has ended</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          Your 14-day trial is up. Upgrade to Pro to keep posting updates, uploading files, and managing unlimited projects. Your data is safe — nothing is deleted.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => startCheckout("pro_annual")}
            className="cursor-pointer w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors"
          >
            Upgrade to Pro — $8/mo ↗
          </button>
          <button
            onClick={() => startCheckout("lifetime")}
            className="cursor-pointer w-full py-3 rounded-xl border-2 border-gray-200 hover:border-gray-900 text-gray-700 font-semibold text-sm transition-colors"
          >
            Get lifetime access — $179
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-4">No data deleted · Cancel anytime</p>
      </div>
    </div>
  );
}

// Hard paywall — not dismissible, triggered on write attempts
export function HardPaywall({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">🔒</span>
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 mb-2">This is a Pro feature</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          Posting updates, uploading files, and creating approvals require an active plan. Upgrade to unlock full access — your existing data is always safe.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => startCheckout("pro_annual")}
            className="cursor-pointer w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors"
          >
            Upgrade to Pro — $8/mo ↗
          </button>
          <button
            onClick={() => startCheckout("lifetime")}
            className="cursor-pointer w-full py-3 rounded-xl border-2 border-gray-200 hover:border-gray-900 text-gray-700 font-semibold text-sm transition-colors"
          >
            Get lifetime access — $179
          </button>
        </div>

        <button onClick={onClose} className="cursor-pointer mt-4 text-[11px] text-gray-400 hover:text-gray-600 underline">
          Go back
        </button>
      </div>
    </div>
  );
}

// Trial banner — shown at top of dashboard during trial
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 3;
  return (
    <div className={`mb-5 border rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 ${urgent ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
      <div className="flex items-center gap-3">
        <span className="text-base">{urgent ? "⚠️" : "🎉"}</span>
        <p className="text-[13px] font-semibold text-gray-900">
          {daysLeft === 1
            ? "Last day of your free trial"
            : `${daysLeft} days left in your free trial`}
          <span className="font-normal text-gray-500 ml-1.5">— upgrade before it ends to keep full access.</span>
        </p>
      </div>
      <button
        onClick={() => startCheckout("pro_annual")}
        className={`cursor-pointer shrink-0 text-[12px] font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${urgent ? "bg-amber-400 hover:bg-amber-300 text-black" : "bg-emerald-500 hover:bg-emerald-400 text-black"}`}
      >
        Upgrade →
      </button>
    </div>
  );
}
