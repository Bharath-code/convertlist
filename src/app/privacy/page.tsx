import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 24, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              ConvertList ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our waitlist conversion assistant service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Email address, password (stored securely by Clerk), and authentication details</li>
              <li><strong>Waitlist Data:</strong> Lead information you upload (emails, names, companies, signup notes, sources)</li>
              <li><strong>Payment Information:</strong> Billing details processed securely by DodoPayments (we don't store card details)</li>
              <li><strong>Communications:</strong> Support requests, feedback, and survey responses</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Cookies:</strong> Authentication and preference cookies via Clerk</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your waitlist data and generate AI-powered scores</li>
              <li>Send service-related communications (updates, security alerts)</li>
              <li>Process payments and manage subscriptions</li>
              <li>Respond to your questions and support requests</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Protect against fraud and unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-slate-600 mb-4">
              We do NOT sell, trade, or rent your personal information to third parties. We may share your data only in these situations:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> With vendors who perform services on our behalf (Clerk for auth, PlanetScale for database, Google for AI scoring, Resend for email)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Security</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>Database is hosted on PlanetScale with encryption at rest</li>
              <li>Authentication handled by Clerk (SOC 2 compliant)</li>
              <li>AI processing via Google Gemini (data not used for training)</li>
              <li>Regular security audits and updates</li>
              <li>Access restricted to authorized personnel only</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Your Data Rights</h2>
            <p className="text-slate-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data (and your account)</li>
              <li>Export your data in CSV format</li>
              <li>Opt-out of marketing communications</li>
              <li>Restrict or object to data processing</li>
            </ul>
            <p className="text-slate-600">
              To exercise these rights, contact us at <a href="mailto:support@convertlist.ai" className="text-blue-600 underline">support@convertlist.ai</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Data Retention</h2>
            <p className="text-slate-600 mb-4">
              We retain your data for as long as your account is active. You can delete your waitlists or account at any time. After account deletion, we retain data for 30 days for backup purposes, then permanently delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. International Data Transfers</h2>
            <p className="text-slate-600 mb-4">
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses and adherence to privacy frameworks.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
            <p className="text-slate-600 mb-4">
              Our service is not intended for children under 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-slate-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-none text-slate-600 space-y-1">
              <li>Email: <a href="mailto:support@convertlist.ai" className="text-blue-600 underline">support@convertlist.ai</a></li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2026 ConvertList. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
