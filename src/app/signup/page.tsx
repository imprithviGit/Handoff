"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) { setError(error); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Hand<span className="text-emerald-500">off</span></span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8">
          <h1 className="text-[18px] font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-[13px] text-gray-400 mb-6">Free forever · No credit card needed</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Your name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aryan Mehta"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.co"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-[13px] font-semibold transition-colors mt-2"
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
