export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="inline-flex items-center gap-2 mb-10 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Back to Handoff
        </a>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 2025</p>

        <div className="prose prose-sm text-gray-600 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. What we collect</h2>
            <p className="leading-relaxed">When you sign up for Handoff, we collect your name and email address. When you create projects, we store project details, messages, files, and approval records you add to the platform. We also collect basic usage data to help us improve the product.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. How we use your data</h2>
            <p className="leading-relaxed">We use your data to provide the Handoff service, send you transactional emails (such as client reply notifications and trial reminders), and improve the product. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data storage</h2>
            <p className="leading-relaxed">Your data is stored securely using Supabase (database and file storage) hosted on AWS infrastructure. Authentication is handled by Clerk. Payments are processed by Dodo Payments. All providers operate with industry-standard security practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Files and client data</h2>
            <p className="leading-relaxed">Files you upload are stored in secure cloud storage and accessible only via your project's unique share link. Client names and emails you enter are used solely to identify projects on your dashboard and are never shared or used for marketing.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Cookies</h2>
            <p className="leading-relaxed">We use cookies for authentication and session management only. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Your rights</h2>
            <p className="leading-relaxed">You can request deletion of your account and all associated data at any time by emailing us at hello@gethandoff.co. We will process your request within 7 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Contact</h2>
            <p className="leading-relaxed">If you have any questions about this policy, email us at <a href="mailto:hello@gethandoff.co" className="text-emerald-600 hover:underline">hello@gethandoff.co</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
