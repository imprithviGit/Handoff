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

function PricingCards({ onClose, showClose }: { onClose: () => void; showClose: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-auto">
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg cursor-pointer z-10"
          >
            ✕
          </button>
        )}

        <div className="p-7 pb-5 text-center border-b border-gray-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Upgrade to Pro</p>
          <h2 className="text-xl font-extrabold text-gray-900">Simple, transparent pricing</h2>
          <p className="text-[13px] text-gray-400 mt-1">Pick a plan that works for you. Your data is safe — nothing is deleted.</p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monthly */}
          <div className="border border-gray-200 rounded-2xl p-5 flex flex-col">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Monthly</p>
            <div className="flex items-end gap-1 mb-0.5">
              <p className="text-3xl font-extrabold text-gray-900">$11</p>
              <span className="text-gray-400 text-sm mb-1">/mo</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Billed monthly, cancel anytime</p>
            <ul className="space-y-2 mb-6 flex-1">
              {["Unlimited projects", "Shareable client portal", "File uploads & approvals", "Custom branding", "Priority support"].map((item, i) => (
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

          {/* Annual — most popular */}
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
              {["Unlimited projects", "Shareable client portal", "File uploads & approvals", "Custom branding", "Priority support"].map((item, i) => (
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

          {/* Lifetime — limited time offer */}
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

        <div className="px-7 pb-5 text-center">
          <p className="text-[11px] text-gray-400">No data deleted · Cancel anytime · Secure payment via Dodo Payments</p>
          {!showClose && (
            <button onClick={onClose} className="cursor-pointer mt-3 text-[11px] text-gray-400 hover:text-gray-600 underline">
              Go back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Full-screen overlay — dismissible (soft paywall)
export function PaywallOverlay({ onDismiss }: { onDismiss: () => void }) {
  return <PricingCards onClose={onDismiss} showClose={true} />;
}

// Hard paywall — not dismissible, triggered on write attempts
export function HardPaywall({ onClose }: { onClose: () => void }) {
  return <PricingCards onClose={onClose} showClose={false} />;
}

