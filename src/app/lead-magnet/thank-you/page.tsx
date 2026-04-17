import Link from "next/link";
import { CheckCircle, Share2, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/patterns";

export default function ThankYouPage() {
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

      {/* Thank You Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-[#C2410C] rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-[#FAFAF9]" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-display font-semibold leading-tight mb-4">
            Check your inbox!
          </h1>
          <p className="text-xl text-[#57534E] mb-12 max-w-2xl mx-auto">
            Your lead magnet is on its way. If you don't see it within 5 minutes, check your spam folder.
          </p>

          {/* Secondary CTA */}
          <div className="bg-white p-8 rounded-lg border border-[#E7E5E4] mb-12">
            <h2 className="text-2xl font-display font-semibold mb-4">Ready to automate this?</h2>
            <p className="text-[#57534E] mb-6">
              ConvertList scores every lead automatically and generates personalized emails based on their signup note.
            </p>
            <Link href="/sign-up">
              <Button className="bg-[#1C1917] text-white hover:bg-[#292524] px-8 py-4 text-base font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer">
                Score 25 leads free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Social Share */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share this resource
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://twitter.com/intent/tweet?text=Just%20downloaded%20the%20Waitlist%20Scoring%20Checklist%20from%20ConvertList%20-%20going%20to%20identify%20which%20leads%20are%203x%20more%20likely%20to%20convert%20%Ffounder%20%Fwaitlist%20%Fsaas"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-[#E7E5E4] text-sm font-semibold hover:border-[#D6D3D1] hover:bg-[#FAFAF9] transition-colors cursor-pointer"
              >
                Share on Twitter
              </a>
              <a
                href="https://www.linkedin.com/sharing/share-offsite/?url=https://convertlist.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-[#E7E5E4] text-sm font-semibold hover:border-[#D6D3D1] hover:bg-[#FAFAF9] transition-colors cursor-pointer"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>

          {/* Related Content */}
          <div className="bg-[#1C1917] text-[#FAFAF9] p-8 rounded-lg">
            <h3 className="text-xl font-display font-semibold mb-4 flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              More resources
            </h3>
            <div className="space-y-3">
              <Link href="/lead-magnets/email-templates" className="block text-[#A8A29E] hover:text-[#FAFAF9] transition-colors cursor-pointer">
                10 Cold Email Templates →
              </Link>
              <Link href="/lead-magnets/playbook" className="block text-[#A8A29E] hover:text-[#FAFAF9] transition-colors cursor-pointer">
                Complete Waitlist Conversion Playbook →
              </Link>
            </div>
          </div>
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
