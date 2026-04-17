import Link from "next/link";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/patterns";

export default function EmailTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917]">
      {/* Navigation */}
      <nav className="border-b border-[#E7E5E4] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-display font-semibold tracking-tight">
            ConvertList
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-display font-semibold leading-tight mb-6">
              10 Cold Email Templates
              <br />
              <span className="text-[#C2410C]">That Actually Get Replies</span>
            </h1>
            <p className="text-xl text-[#57534E] max-w-2xl mx-auto leading-relaxed">
              Copy-paste templates for Hot, Warm, and Cold leads. Used by founders to hit 20%+ reply rates.
            </p>
          </div>

          {/* What's Inside */}
          <div className="bg-white p-8 rounded-lg border border-[#E7E5E4] mb-12">
            <h2 className="text-2xl font-display font-semibold mb-6">What's Included</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#C2410C]" />
                  3 Initial Outreach Templates
                </h3>
                <p className="text-sm text-[#57534E]">
                  For Hot leads with urgent pain points, Warm leads with specific use cases, and Cold leads requiring re-engagement
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#C2410C]" />
                  4 Follow-Up Sequences
                </h3>
                <p className="text-sm text-[#57534E]">
                  First follow-up, value-add case study, social proof, and break-up email templates
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#C2410C]" />
                  3 Special Situation Templates
                </h3>
                <p className="text-sm text-[#57534E]">
                  Demo request response, pricing objection handling, and referral request templates
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#C2410C]" />
                  Best Practices Guide
                </h3>
                <p className="text-sm text-[#57534E]">
                  Personalization tips, subject line formulas, timing recommendations, and metrics to track
                </p>
              </div>
            </div>
          </div>

          {/* Email Capture Form */}
          <div className="max-w-2xl mx-auto bg-[#1C1917] text-[#FAFAF9] p-8 rounded-lg">
            <h3 className="text-2xl font-display font-semibold mb-2">Get the Templates Free</h3>
            <p className="text-[#A8A29E] mb-6">
              Copy-paste templates that hit 20%+ reply rates. No credit card required.
            </p>
            <form 
              action="/api/lead-magnet/capture" 
              method="POST"
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-[#292524] text-[#FAFAF9] placeholder-[#78716C] border border-[#44403C] focus:outline-none focus:border-[#C2410C]"
              />
              <input type="hidden" name="magnetType" value="EMAIL_TEMPLATES" />
              <button
                type="submit"
                className="bg-[#C2410C] text-[#FAFAF9] px-6 py-3 rounded-lg font-semibold hover:bg-[#EA580C] transition-colors cursor-pointer"
              >
                Get the templates
              </button>
            </form>
            <p className="text-xs text-[#78716C] mt-4">
              Instant download. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-t border-[#E7E5E4]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-[#78716C] tracking-wider uppercase mb-4">
            Used by 500+ indie founders
          </p>
          <p className="text-[#57534E]">
            "These templates helped me go from 2% to 18% reply rates on my waitlist."
          </p>
          <p className="text-sm text-[#78716C] mt-2">— Founder, SaaS startup</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-[#78716C]">© 2024 ConvertList. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
