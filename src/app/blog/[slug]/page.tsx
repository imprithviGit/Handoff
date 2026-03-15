import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts, getPostBySlug } from "@/content/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found — Handoff" };
  }

  return {
    title: `${post.title} — Handoff Blog`,
    description: post.description,
    metadataBase: new URL("https://www.gethandoff.co"),
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.gethandoff.co/blog/${post.slug}`,
      siteName: "Handoff",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      site: "@gethandoff",
    },
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

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
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
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

      {/* ── ARTICLE ── */}
      <article className="max-w-2xl mx-auto px-8 pt-14 pb-16">
        {/* Back link */}
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors mb-10"
        >
          ← All articles
        </a>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-medium text-gray-400">
            {formatDate(post.date)}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-xs font-medium text-gray-400">
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-8"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {post.title}
        </h1>

        {/* Divider */}
        <div className="w-12 h-1 bg-emerald-500 rounded-full mb-10" />

        {/* Prose content */}
        <style>{`
          .blog-prose h2 {
            font-family: var(--font-syne), sans-serif;
            font-size: 1.375rem;
            font-weight: 800;
            color: #111827;
            margin-top: 2.5rem;
            margin-bottom: 0.875rem;
            line-height: 1.3;
          }
          .blog-prose h3 {
            font-family: var(--font-syne), sans-serif;
            font-size: 1.1rem;
            font-weight: 700;
            color: #1f2937;
            margin-top: 2rem;
            margin-bottom: 0.625rem;
            line-height: 1.4;
          }
          .blog-prose p {
            font-size: 1rem;
            line-height: 1.8;
            color: #374151;
            margin-bottom: 1.25rem;
          }
          .blog-prose ul {
            margin-bottom: 1.25rem;
            padding-left: 0;
            list-style: none;
          }
          .blog-prose ul li {
            font-size: 1rem;
            line-height: 1.75;
            color: #374151;
            padding-left: 1.25rem;
            margin-bottom: 0.5rem;
            position: relative;
          }
          .blog-prose ul li::before {
            content: "–";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: 600;
          }
          .blog-prose strong {
            font-weight: 700;
            color: #111827;
          }
          .blog-prose a {
            color: #059669;
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          .blog-prose a:hover {
            color: #047857;
          }
        `}</style>

        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-8 pb-20">
        <div className="bg-emerald-500 rounded-2xl px-8 py-10 text-center">
          <p
            className="text-xl font-extrabold text-black mb-2"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Ready to stop chasing clients?
          </p>
          <p className="text-sm text-black/60 mb-6 max-w-xs mx-auto leading-relaxed">
            Set up your first project portal in 30 seconds. No credit card
            needed.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-emerald-400 font-bold text-sm px-7 py-3.5 rounded-full transition-colors"
          >
            Try Handoff free →
          </a>
        </div>
      </section>

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
            © 2025 Handoff — Built for freelancers.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
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
