import Link from "next/link";
import { BookOpen, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/patterns";

export default function PlaybookPage() {
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
              The Complete Waitlist
              <br />
              <span className="text-[#C2410C]">Conversion Playbook</span>
            </h1>
            <p className="text-xl text-[#57534E] max-w-2xl mx-auto leading-relaxed">
              From 2% to 20%: The comprehensive guide to converting your waitlist into paying customers.
            </p>
          </div>

          {/* What's Inside */}
          <div className="bg-white p-8 rounded-lg border border-[#E7E5E4] mb-12">
            <h2 className="text-2xl font-display font-semibold mb-6">25-Page Comprehensive Guide</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C2410C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Understanding Your Waitlist</h3>
                  <p className="text-sm text-[#57534E]">Who's on your waitlist and why they signed up</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C2410C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Lead Scoring Framework</h3>
                  <p className="text-sm text-[#57534E]">How to score manually and create your own rubric</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C2410C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Segmentation Strategy</h3>
                  <p className="text-sm text-[#57534E]">Hot/Warm/Cold: What each segment needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C2410C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Personalized Outreach</h3>
                  <p className="text-sm text-[#57534E]">5 examples of personalized emails that convert</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C2410C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Follow-Up Sequences</h3>
                  <p className="text-sm text-[#57534E]">The ideal cadence and what to say in each follow-up</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C2410C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Pipeline Management</h3>
                  <p className="text-sm text-[#57534E]">Tracking leads through stages and measuring conversion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Capture Form */}
          <div className="max-w-2xl mx-auto bg-[#1C1917] text-[#FAFAF9] p-8 rounded-lg">
            <h3 className="text-2xl font-display font-semibold mb-2">Get the Playbook Free</h3>
            <p className="text-[#A8A29E] mb-6">
              25-page comprehensive guide. Delivered via 5-email drip sequence over 5 days.
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
              <input type="hidden" name="magnetType" value="PLAYBOOK" />
              <button
                type="submit"
                className="bg-[#C2410C] text-[#FAFAF9] px-6 py-3 rounded-lg font-semibold hover:bg-[#EA580C] transition-colors cursor-pointer"
              >
                Get the playbook
              </button>
            </form>
            <p className="text-xs text-[#78716C] mt-4">
              Email delivery over 5 days. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-t border-[#E7E5E4]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-[#78716C] tracking-wider uppercase mb-4">
            Downloaded by 2,000+ founders
          </p>
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-[#EA580C] text-[#EA580C]" />
            ))}
          </div>
          <p className="text-[#57534E]">
            "This playbook completely changed how I approach my waitlist. Went from 2% to 22% conversion."
          </p>
          <p className="text-sm text-[#78716C] mt-2">— Founder, B2B SaaS</p>
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
