export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="inline-flex items-center gap-2 mb-10 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Back to Handoff
        </a>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 2025</p>

        <div className="prose prose-sm text-gray-600 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance</h2>
            <p className="leading-relaxed">By signing up for or using Handoff, you agree to these terms. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. The service</h2>
            <p className="leading-relaxed">Handoff provides a client portal tool for freelancers. You can create projects, share links with clients, post updates, manage file approvals, and communicate in one place. We reserve the right to modify or discontinue features at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Your account</h2>
            <p className="leading-relaxed">You are responsible for maintaining the security of your account. You must not share your login credentials or use the service for any unlawful purpose. You must be at least 16 years old to use Handoff.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Free trial and billing</h2>
            <p className="leading-relaxed">New accounts receive a 14-day free trial with full access. No credit card is required during the trial. After the trial, continued use of Pro features requires a paid subscription. Subscriptions are billed through Dodo Payments and can be cancelled at any time. Refunds are handled per Dodo Payments refund policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Your content</h2>
            <p className="leading-relaxed">You own the content you upload to Handoff. By uploading content you grant us a limited licence to store and display it as part of providing the service. We do not claim ownership over your files, projects, or communications.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Prohibited use</h2>
            <p className="leading-relaxed">You may not use Handoff to share illegal content, send spam, attempt to access other users accounts, reverse engineer the platform, or do anything that could harm the service or other users.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Limitation of liability</h2>
            <p className="leading-relaxed">Handoff is provided as-is. We are not liable for any loss of data, business interruption, or indirect damages arising from use of the service. Our total liability is limited to the amount you paid us in the 3 months prior to any claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Termination</h2>
            <p className="leading-relaxed">You can delete your account at any time by contacting hello@gethandoff.co. We may suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact</h2>
            <p className="leading-relaxed">Questions about these terms? Email us at <a href="mailto:hello@gethandoff.co" className="text-emerald-600 hover:underline">hello@gethandoff.co</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
