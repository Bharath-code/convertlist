import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 24, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing or using ConvertList (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-4">
              ConvertList is a waitlist conversion assistant that helps founders analyze waitlist signups, score leads using AI, and generate personalized outreach messages. We reserve the right to modify or discontinue the Service at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>You must be at least 18 years old to use this Service</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Acceptable Use</h2>
            <p className="text-slate-600 mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload waitlists containing personal data you don't have rights to process</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Resell, rent, or sublicense the Service</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. User Data</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Ownership:</strong> You retain all rights to your waitlist data</li>
              <li><strong>License:</strong> You grant us a license to process your data solely for providing the Service</li>
              <li><strong>Responsibility:</strong> You are responsible for ensuring you have rights to upload lead data</li>
              <li><strong>Backup:</strong> We recommend regularly exporting your data; we are not responsible for data loss</li>
              <li><strong>Deletion:</strong> You can delete your data at any time; deleted data is removed within 30 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Intellectual Property</h2>
            <p className="text-slate-600 mb-4">
              The Service and its original content, features, and functionality are owned by ConvertList and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Payment Terms</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Fees:</strong> Some features require a paid subscription</li>
              <li><strong>Billing:</strong> Payments are processed by DodoPayments (third-party processor)</li>
              <li><strong>Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
              <li><strong>Refunds:</strong> We offer refunds within 14 days of purchase if you're unsatisfied</li>
              <li><strong>Price Changes:</strong> We will notify you 30 days before any price changes</li>
              <li><strong>Taxes:</strong> You are responsible for any applicable taxes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-slate-600 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="text-slate-600 mb-4">
              WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>AI scoring results will be accurate or reliable</li>
              <li>The Service will meet your specific requirements</li>
              <li>Any defects will be corrected</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CONVERTLIST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY AS A RESULT OF:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to our servers</li>
              <li>Data breaches or security incidents (we implement reasonable security measures)</li>
              <li>Any errors or omissions in Service content</li>
              <li>Defamation, harassment, or other conduct of other users</li>
            </ul>
            <p className="text-slate-600 mb-4">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Indemnification</h2>
            <p className="text-slate-600 mb-4">
              You agree to indemnify, defend, and hold harmless ConvertList from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights (including data protection rights)</li>
              <li>Your upload of waitlist data without proper consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Termination</h2>
            <p className="text-slate-600 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
            <p className="text-slate-600 mb-4">
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify these Terms at any time. We will provide at least 30 days' notice of any material changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">13. Governing Law</h2>
            <p className="text-slate-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes shall be resolved in the courts located in [Your Location].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">14. Contact Information</h2>
            <p className="text-slate-600 mb-4">
              For questions about these Terms, please contact us at:
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
