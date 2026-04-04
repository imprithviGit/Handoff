import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog — Handoff",
  description:
    "Practical guides for freelancers on client management, project organisation, and building a better freelance business.",
  metadataBase: new URL("https://www.gethandoff.co"),
  openGraph: {
    title: "Blog — Handoff",
    description:
      "Practical guides for freelancers on client management, project organisation, and building a better freelance business.",
    url: "https://www.gethandoff.co/blog",
    siteName: "Handoff",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Handoff",
    description:
      "Practical guides for freelancers on client management, project organisation, and building a better freelance business.",
    site: "@gethandoff",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "var(--font-geist), sans-serif" }}
    >
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 flex items-center gap-10 h-16">
          <a href="/" className="cursor-pointer shrink-0 flex items-center gap-2">
            <img
              src="/handoff-logo.png"
              alt="Handoff"
              className="w-7 h-7 rounded-lg"
            />
            <span
              className="text-xl font-extrabold tracking-tight text-gray-900"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Hand<span className="text-emerald-500">off</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8 flex-1">
            <a
              href="/#features"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/blog"
              className="text-sm font-medium text-gray-900 transition-colors"
            >
              Blog
            </a>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-full transition-colors"
            >
              Get started free ↗
            </a>
          </div>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <header className="max-w-5xl mx-auto px-8 pt-16 pb-12">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
          Blog
        </p>
        <h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          For freelancers who want to{" "}
          <span className="text-emerald-500">work better.</span>
        </h1>
        <p className="text-base text-gray-500 max-w-xl leading-relaxed">
          Practical guides on client management, project organisation, and
          building a freelance business that runs without the chaos.
        </p>
      </header>

      {/* ── POST GRID ── */}
      <main className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-50 rounded-2xl p-7 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-gray-400">
                  {formatDate(post.date)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs font-medium text-gray-400">
                  {post.readTime}
                </span>
              </div>
              <h2
                className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-emerald-600 transition-colors"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {post.description}
              </p>
              <span className="text-sm font-semibold text-emerald-600 group-hover:underline underline-offset-2">
                Read article →
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white px-8 py-7">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/handoff-logo.png"
              alt="Handoff"
              className="w-6 h-6 rounded-md"
            />
            <span
              className="text-lg font-extrabold text-gray-900"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Hand<span className="text-emerald-500">off</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 Handoff. Built for freelancers.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </a>
            <a
              href="https://x.com/gethandoff"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
