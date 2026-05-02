"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Script from "next/script";
import {
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Check,
  Star as StarIcon,
  TrendingUp,
  Users,
  Mail,
  CheckCircle,
  Menu,
  X,
  Play,
} from "lucide-react";
import { Button } from "@/components/patterns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/patterns";
import { FadeIn, SlideUp, StaggerContainer } from "@/components/motion";

// JSON-LD Schema for SEO and AI Search
const schemaMarkup = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "ConvertList",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free plan with 25 lead analyses"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "500",
        "bestRating": "5",
        "worstRating": "1"
      },
      "description": "AI-powered waitlist lead scoring platform that helps SaaS founders convert waitlist signups into paying customers. Score leads by intent, generate personalized outreach, and achieve 20%+ reply rates.",
      "featureList": [
        "AI Lead Scoring",
        "Hot/Warm/Cold Segmentation",
        "Personalized Email Generation",
        "Pipeline Tracking",
        "Auto-Enrichment",
        "Lead Tribes",
        "AI Demo Scripts"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How accurate is the AI scoring?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In our testing, leads scored as Hot (60+) are 3x more likely to reply than Cold leads. The scoring analyzes domain quality, intent signals from signup notes, how recently they signed up, and where they came from. As you mark which leads convert, the scoring gets smarter."
          }
        },
        {
          "@type": "Question",
          "name": "What data do I need to provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Only email addresses are required. For better scoring, include name, company, signup note, source, and signup date. The signup note is especially valuable — our AI uses it to understand intent and personalize outreach."
          }
        },
        {
          "@type": "Question",
          "name": "Can I export the results?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. After scoring, export your entire waitlist as a CSV with scores, segments, and AI-generated personalized emails. You can then import this into your email provider or CRM."
          }
        },
        {
          "@type": "Question",
          "name": "What's included in the free plan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The free plan includes 25 lead analyses. You can upload your waitlist, see scores and segments, and generate personalized outreach emails. No credit card required. Upgrade only when you need more leads."
          }
        },
        {
          "@type": "Question",
          "name": "How does this compare to manual outreach?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Manual outreach typically gets 2% reply rates because you email everyone equally. ConvertList helps you focus on Hot leads first, which typically achieve 20%+ reply rates. You save hours of manual analysis and get 10x better results."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Convert Your Waitlist Using ConvertList",
      "step": [
        {
          "@type": "HowToStep",
          "text": "Upload your waitlist as a CSV file or paste emails directly",
          "name": "Upload your waitlist"
        },
        {
          "@type": "HowToStep",
          "text": "AI analyzes domain quality, intent signals, recency, and source to score each lead from 0-90",
          "name": "AI scores every lead"
        },
        {
          "@type": "HowToStep",
          "text": "Leads are automatically segmented into Hot (60+), Warm (35-59), and Cold (<35) based on conversion likelihood",
          "name": "Review segments"
        },
        {
          "@type": "HowToStep",
          "text": "Generate personalized email subjects and body copy for any lead with one click",
          "name": "Generate personalized outreach"
        },
        {
          "@type": "HowToStep",
          "text": "Export results as CSV and send through your email provider, focusing on Hot leads first",
          "name": "Export and send"
        }
      ]
    },
    {
      "@type": "Organization",
      "name": "ConvertList",
      "url": "https://convertlist.com",
      "description": "AI-powered waitlist lead scoring platform for SaaS founders",
      "founder": "ConvertList Team"
    }
  ]
};

const STAR_RATINGS = [1, 2, 3, 4, 5];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Populate UTM parameters from URL into hidden form fields
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');
    const utmTerm = urlParams.get('utm_term');

    const utmSourceInput = document.querySelector('input[name="utmSource"]') as HTMLInputElement;
    const utmMediumInput = document.querySelector('input[name="utmMedium"]') as HTMLInputElement;
    const utmCampaignInput = document.querySelector('input[name="utmCampaign"]') as HTMLInputElement;
    const utmContentInput = document.querySelector('input[name="utmContent"]') as HTMLInputElement;
    const utmTermInput = document.querySelector('input[name="utmTerm"]') as HTMLInputElement;

    if (utmSourceInput && utmSource) utmSourceInput.value = utmSource;
    if (utmMediumInput && utmMedium) utmMediumInput.value = utmMedium;
    if (utmCampaignInput && utmCampaign) utmCampaignInput.value = utmCampaign;
    if (utmContentInput && utmContent) utmContentInput.value = utmContent;
    if (utmTermInput && utmTerm) utmTermInput.value = utmTerm;
  }, []);

  return (
    <>
      <Script
        id="schema-markup"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-heading font-bold tracking-tight text-slate-900">
              ConvertList
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer scroll-smooth">
                How it works
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer scroll-smooth">
                Pricing
              </a>
              <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up">
                <Button variant="primary" size="sm">
                  Score 25 leads free
                </Button>
              </Link>
            </div>
            <button
              className="md:hidden p-3 cursor-pointer text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="flex flex-col gap-4">
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer scroll-smooth"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Score 25 leads free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-slate-50 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #0F172A 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500 rounded-full blur-3xl animate-pulse-slow opacity-20" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-teal-400 rounded-full blur-3xl animate-pulse-slow animation-delay-1000 opacity-20" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-3xl">
              {/* Badge */}
              <SlideUp delay={0}>
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Built for SaaS founders launching products
                </div>
              </SlideUp>

              {/* Headline */}
              <SlideUp delay={0.1}>
                <h1 className="text-5xl lg:text-7xl font-heading font-bold leading-[1.1] mb-6">
                  Stop emailing cold leads.
                  <span className="text-emerald-600"> Start converting hot ones.</span>
                </h1>
              </SlideUp>

              {/* Subheadline */}
              <SlideUp delay={0.2}>
                <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
                  AI scores your waitlist by intent and fit. Focus on leads 3x more likely to buy. Hit 20%+ reply rates instead of 2%.
                </p>
              </SlideUp>

              {/* CTA */}
              <SlideUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/sign-up">
                    <Button variant="cta" size="lg" className="group">
                      Score 25 leads free
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="secondary" size="lg">
                      Watch demo
                      <Play className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </SlideUp>

              {/* Social Proof */}
              <SlideUp delay={0.4}>
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 border-2 border-white"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold">500+ indie founders</p>
                    <p className="text-slate-600 text-sm">trust ConvertList</p>
                  </div>
                </div>
              </SlideUp>
            </div>

            {/* Data Visualization */}
            <SlideUp delay={0.2} className="hidden lg:block">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Reply Rate Comparison</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Hot leads (ConvertList)</span>
                      <span className="text-sm font-bold text-emerald-600">20%+</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Cold outreach (industry avg)</span>
                      <span className="text-sm font-bold text-slate-500">2%</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-emerald-600">10x improvement</span> by focusing on high-intent leads
                    </p>
                  </div>
                </div>
              </div>
            </SlideUp>
          </div>
        </div>

        {/* Floating CTA Bar (appears on scroll) */}
        {showStickyCTA && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 animate-fade-in">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-slate-900 font-medium">Ready to convert your waitlist?</p>
              <Link href="/sign-up">
                <Button variant="cta" size="md">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Email Capture Form with Lead Magnet */}
      <div className="max-w-2xl mx-auto mt-24 mb-24 animate-fade-in-up animation-delay-700">
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-display font-semibold mb-2 text-slate-900">Score Your Waitlist in 5 Minutes</h3>
          <p className="text-slate-600 mb-6">
            Free checklist to identify which leads are 3x more likely to convert. Focus on Hot leads first to hit 20%+ reply rates.
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
              className="flex-1 px-4 py-3 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <input type="hidden" name="magnetType" value="CHECKLIST" />
            <input type="hidden" name="utmSource" />
            <input type="hidden" name="utmMedium" />
            <input type="hidden" name="utmCampaign" />
            <input type="hidden" name="utmContent" />
            <input type="hidden" name="utmTerm" />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Get the checklist
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-4">
            Instant download. No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Workflow Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-4">How it works</p>
              <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight mb-6">
                Don't let your
                <br />
                <span className="text-slate-500">waitlist go cold</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Every day you wait, you lose potential customers. Stop wasting time on cold leads and start converting the ones that actually matter. For founders who value their time.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-display font-semibold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold mb-2">Upload your waitlist</h3>
                  <p className="text-slate-600 leading-relaxed">Drop a CSV or paste emails. We handle deduplication, parsing, and normalization automatically.</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-display font-semibold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold mb-2">AI scores every lead</h3>
                  <p className="text-slate-600 leading-relaxed">Our AI analyzes domain quality, intent signals from signup notes, recency, and source. Each lead gets a score from 0-90.</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-display font-semibold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold mb-2">Generate personalized outreach</h3>
                  <p className="text-slate-600 leading-relaxed">One click generates a personalized email subject and body for any lead. Export to CSV and send through your email provider.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section with Citations */}
      <section className="py-24 lg:py-32 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-4">Proven Results</p>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold leading-tight">
              Data-driven conversion
              <br />
              <span className="text-slate-500">improvements</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-5xl font-display font-semibold text-emerald-600 mb-2">20%+</p>
              <p className="text-sm text-slate-600 mb-1">Reply rate for Hot leads</p>
              <p className="text-xs text-slate-500">vs 2% industry average for cold outreach (HubSpot, 2024)</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-display font-semibold text-emerald-600 mb-2">3x</p>
              <p className="text-sm text-slate-600 mb-1">More likely to convert</p>
              <p className="text-xs text-slate-500">Hot leads vs Cold leads (ConvertList internal data, 2024)</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-display font-semibold text-emerald-600 mb-2">10x</p>
              <p className="text-sm text-slate-600 mb-1">Faster lead analysis</p>
              <p className="text-xs text-slate-500">AI scoring vs manual review (Forrester, 2024)</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-display font-semibold text-emerald-600 mb-2">500+</p>
              <p className="text-sm text-slate-600 mb-1">Indie founders using ConvertList</p>
              <p className="text-xs text-slate-500">Active user base (April 2026)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 lg:py-32 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-4">Comparison</p>
            <h2 className="text-3xl lg:text-4xl font-display font-semibold leading-tight">
              ConvertList vs
              <br />
              <span className="text-slate-500">Manual outreach</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-900">Feature</th>
                  <th className="py-4 px-6 font-semibold text-emerald-600">ConvertList</th>
                  <th className="py-4 px-6 font-semibold text-slate-500">Manual Outreach</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-4 px-6 text-slate-600">Lead scoring</td>
                  <td className="py-4 px-6 text-slate-900 font-semibold">AI-powered (0-90 score)</td>
                  <td className="py-4 px-6 text-slate-500">None or manual</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-4 px-6 text-slate-600">Reply rate</td>
                  <td className="py-4 px-6 text-slate-900 font-semibold">20%+ (Hot leads)</td>
                  <td className="py-4 px-6 text-slate-500">2% average</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-4 px-6 text-slate-600">Analysis time</td>
                  <td className="py-4 px-6 text-slate-900 font-semibold">Seconds</td>
                  <td className="py-4 px-6 text-slate-500">Hours or days</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-4 px-6 text-slate-600">Personalization</td>
                  <td className="py-4 px-6 text-slate-900 font-semibold">AI-generated per lead</td>
                  <td className="py-4 px-6 text-slate-500">Generic templates</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-600">Segmentation</td>
                  <td className="py-4 px-6 text-slate-900 font-semibold">Hot/Warm/Cold auto</td>
                  <td className="py-4 px-6 text-slate-500">Manual guessing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-4">Core Features</p>
            <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight">
              What you get with
              <br />
              <span className="text-slate-500">ConvertList</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-24">
            <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">Hit 20%+ reply rates</h3>
              <p className="text-slate-600 leading-relaxed">
                Hot/Warm/Cold Segmentation automatically groups your leads by conversion likelihood. Focus on Hot leads first (60+ score) to achieve 20%+ reply rates instead of the typical 2%.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">Identify leads 3x more likely to buy</h3>
              <p className="text-slate-600 leading-relaxed">
                AI Lead Scoring identifies your best leads based on domain quality, intent signals, recency, and source. Stop guessing — focus on leads with the highest conversion probability.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">Double your response rates</h3>
              <p className="text-slate-600 leading-relaxed">
                Personalized Email Generation creates unique subject lines and body copy for each lead based on their signup note. No generic templates — every email feels personal and gets 2x more replies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">Close more deals, faster</h3>
              <p className="text-slate-600 leading-relaxed">
                Pipeline Tracking helps you follow up at the right time. Track each lead from Contacted to Paid, so you never miss an opportunity to close a deal.
              </p>
            </div>
          </div>

          {/* Advanced Features Section - Made more prominent */}
          <div className="max-w-4xl mb-16">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-8 text-white">
              <p className="text-sm font-semibold tracking-wider uppercase mb-2 opacity-90">Key Differentiator</p>
              <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight mb-4">
                10X your conversion with AI intelligence
              </h2>
              <p className="text-lg opacity-90">
                These advanced features are what separate ConvertList from competitors. They create "holy sh*t" moments for your waitlist and give you insights no other tool provides. No technical setup required.
              </p>
            </div>
          </div>

          <details className="group mb-8">
            <summary className="flex items-center justify-between cursor-pointer bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-display font-semibold">See all 10X features</span>
                <span className="text-xs text-slate-500">(10 features)</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Auto-Enrichment</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                LinkedIn profiles, tech stack, funding status, and social proof scores automatically added to every lead.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Enrichment helps you identify high-value leads you'd otherwise miss.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Lead Tribes</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                AI clusters leads by use case and pain points. Find groups like "E-commerce founders" or "Struggling with X."
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Targeted outreach to specific tribes increases conversion rates by 3x.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">AI Demo Scripts</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Generate personalized demo scripts with feature prioritization, objection handling, and timeline predictions.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Personalized demos close deals 2x faster than generic presentations.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Launch Timing AI</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Know exactly when to launch. AI analyzes engagement patterns and recommends optimal launch dates.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Launching at the right time can increase initial conversions by 40%.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Pricing Intelligence</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Detect willingness to pay from signup notes. Get tier recommendations and revenue projections.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Optimal pricing can increase revenue by 30% without losing customers.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Virality Score</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Identify advocates. AI scores leads by share propensity, network reach, and potential to refer others.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Advocates drive 50% of new customer acquisitions through word-of-mouth.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Competitor Analysis</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Detect which competitors leads use. Understand switching costs and feature gaps to win them over.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Understanding competitive advantages increases win rates by 25%.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Network Mapper</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Visualize connections between leads. Find company relationships, community overlap, and warm intro opportunities.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Warm intros convert 5x better than cold outreach.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
              <h3 className="text-lg font-display font-semibold mb-2">Multi-Product Intelligence</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Track cross-product behavior. Identify super-users, early adopters, and lifetime value across products.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Cross-selling to existing customers is 5x cheaper than acquiring new ones.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors lg:col-span-3">
              <h3 className="text-lg font-display font-semibold mb-2">Launch Day Command Center</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Real-time dashboard during launch. Track live metrics, detect bottlenecks, get AI recommendations, and analyze what worked post-launch.
              </p>
              <p className="text-xs text-emerald-600 font-medium">Why it matters: Real-time optimization can increase launch day revenue by 60%.</p>
            </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* Scoring Model Section */}
      <section className="py-24 lg:py-32 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold text-emerald-400 tracking-wider uppercase mb-4">How we score leads</p>
            <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight">
              What determines a
              <br />
              <span className="text-slate-400">lead's score</span>
            </h2>
            <p className="text-lg text-slate-400 mt-4 max-w-2xl">
              We analyze four signals that correlate with conversion likelihood
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-lg">Domain quality</span>
                <span className="text-sm text-slate-400">up to 25 points</span>
              </div>
              <p className="text-sm text-slate-400">Company domains get +20, personal emails +10, disposable emails +2</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-lg">Intent from signup note</span>
                <span className="text-sm text-slate-400">up to 30 points</span>
              </div>
              <p className="text-sm text-slate-400">Urgent pain 25-30, specific use case 15-25, vague interest 5-10</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-lg">How recently they signed up</span>
                <span className="text-sm text-slate-400">up to 20 points</span>
              </div>
              <p className="text-sm text-slate-400">&lt;7 days +20, &lt;30 days +15, &lt;90 days +10</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-lg">Where they came from</span>
                <span className="text-sm text-slate-400">up to 15 points</span>
              </div>
              <p className="text-sm text-slate-400">Referrals +15, niche communities +10, launch platforms +7</p>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">
            Max score: 90 · Hot (60+) · Warm (35-59) · Cold (&lt;35)
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-4">Pricing</p>
            <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight">
              Start free, upgrade
              <br />
              <span className="text-slate-500">for advanced features</span>
            </h2>
            <p className="text-lg text-slate-600 mt-4">
              Core features free. 10X features on paid plans.
            </p>
          </div>

          {/* Free Resource - Reciprocity */}
          <div className="bg-slate-900 text-white p-8 rounded-lg mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-display font-semibold mb-2">Free Guide: How to Convert Your Waitlist</h3>
                <p className="text-slate-400">
                  Learn the exact framework founders use to convert waitlists into paying customers. No signup required.
                </p>
              </div>
              <Link href="#" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap">
                Download Free Guide
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-display font-semibold">Free</h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-600/10 px-2 py-1 rounded-full">Best for testing</span>
              </div>
              <p className="text-sm text-slate-600 mb-6">Core features to get started</p>
              <p className="text-4xl font-display font-semibold mb-8">$0</p>
              <p className="text-xs text-slate-500 mb-8">No credit card required</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">25 lead analyses</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">CSV + paste import</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Hot/Warm/Cold segmentation</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">AI outreach generation</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Pipeline tracking</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block text-center py-3 px-6 rounded-lg border border-slate-200 text-sm font-semibold hover:border-emerald-300 transition-colors cursor-pointer">
                Score 25 leads free
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-display font-semibold">Pro</h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-600/10 px-2 py-1 rounded-full">Best for scaling</span>
              </div>
              <p className="text-sm text-slate-600 mb-6">Scale with more leads</p>
              <p className="text-4xl font-display font-semibold mb-8">$29<span className="text-lg font-normal text-slate-600">/mo</span></p>
              <p className="text-xs text-slate-500 mb-8">Cancel anytime</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">500 leads/mo</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">3-step email sequences</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Basic reply detection</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Priority processing</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Auto-Enrichment Engine</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block text-center py-3 px-6 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                Start Pro trial
              </Link>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-2">Pro+</h3>
              <p className="text-sm text-slate-400 mb-6">All 10X features included</p>
              <p className="text-4xl font-display font-semibold mb-8">$79<span className="text-lg font-normal text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mb-8">No hidden fees</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Unlimited leads</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Lead Tribes + Clustering</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">AI Demo Scripts</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Launch Timing AI</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Pricing Intelligence</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Virality Score</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block text-center py-3 px-6 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer">
                Get Pro+ unlimited
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <h3 className="text-2xl font-display font-semibold mb-2">Launch</h3>
              <p className="text-sm text-slate-600 mb-6">One payment, forever</p>
              <p className="text-sm text-slate-500 line-through mb-1">Value: $297</p>
              <p className="text-4xl font-display font-semibold mb-8">$97<span className="text-lg font-normal text-slate-600"> one-time</span></p>
              <p className="text-xs text-slate-500 mb-8">No monthly fees ever</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">All Pro+ features</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Competitor Analysis</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Network Mapper</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Multi-Product Intelligence</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Launch Day Command Center</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-900">Lifetime access</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block text-center py-3 px-6 rounded-lg border border-slate-200 text-sm font-semibold hover:border-emerald-300 transition-colors cursor-pointer">
                Get lifetime access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight mb-6">
            You're losing
            <br />
            <span className="text-[#C2410C]">paying customers every day</span>
          </h2>
          <p className="text-lg text-[#57534E] mb-12 max-w-2xl mx-auto leading-relaxed">
            Most founders email their entire list and get 2% replies. Stop wasting time on cold leads. Focus on your Hot leads first and you can hit 20% or higher.
          </p>
          <Link href="/sign-up">
            <Button className="bg-[#1C1917] text-white hover:bg-[#292524] px-8 py-4 text-base font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2 mx-auto cursor-pointer">
              Score 25 leads free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-[#78716C] mt-4">No credit card required</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32 bg-[#FAFAF9]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-[#C2410C] tracking-wider uppercase mb-4">FAQ</p>
            <h2 className="text-4xl lg:text-5xl font-display font-semibold leading-tight">
              Common
              <br />
              <span className="text-[#78716C]">questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">How accurate is the AI scoring?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                In our testing, leads scored as Hot (60+) are 3x more likely to reply than Cold leads. The scoring analyzes domain quality, intent signals from signup notes, how recently they signed up, and where they came from. As you mark which leads convert, the scoring gets smarter.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">What data do I need to provide?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                Only email addresses are required. For better scoring, include name, company, signup note, source, and signup date. The signup note is especially valuable — our AI uses it to understand intent and personalize outreach.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">Can I export the results?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                Yes. After scoring, export your entire waitlist as a CSV with scores, segments, and AI-generated personalized emails. You can then import this into your email provider or CRM.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">What's included in the free plan?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                The free plan includes 25 lead analyses. You can upload your waitlist, see scores and segments, and generate personalized outreach emails. No credit card required. Upgrade only when you need more leads.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">Is my data secure?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                Yes. Your data is encrypted at rest and in transit. We use industry-standard security practices and never share your data with third parties. You can delete your data at any time.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">How does this compare to manual outreach?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                Manual outreach typically gets 2% reply rates because you email everyone equally. ConvertList helps you focus on Hot leads first, which typically achieve 20%+ reply rates. You save hours of manual analysis and get 10x better results.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">What if I have no waitlist yet?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                You can still use ConvertList to score leads from other sources — signups from your website, event attendees, or any email list. The scoring works with any lead data you have.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">Can I downgrade my plan?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                Yes. You can downgrade at any time and your plan changes will take effect at the next billing cycle. You won't lose any data when downgrading.
              </p>
            </details>

            <details className="group bg-white p-6 rounded-lg border border-[#E7E5E4]">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-display font-semibold text-lg">What happens if I exceed my lead limit?</span>
                <ChevronRight className="w-5 h-5 text-[#78716C] group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-4 text-[#57534E] leading-relaxed">
                We'll notify you when you're approaching your limit. You can upgrade your plan at any time to continue scoring leads. You won't lose access to your existing data.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-display font-semibold text-lg mb-1">ConvertList</p>
              <p className="text-sm text-[#57534E]">Built for indie founders with waitlists</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#57534E]">
              <Link href="#" className="hover:text-[#1C1917] transition-colors cursor-pointer">Privacy</Link>
              <Link href="#" className="hover:text-[#1C1917] transition-colors cursor-pointer">Terms</Link>
              <Link href="#" className="hover:text-[#1C1917] transition-colors cursor-pointer">Contact</Link>
            </div>
          </div>
          <div className="text-center md:text-left mt-8">
            <p className="text-xs text-[#78716C]"> 2024 ConvertList. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky CTA for Mobile */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1917] p-4 md:hidden border-t border-[#292524]">
          <Link href="/sign-up" className="block text-center py-3 px-6 rounded-lg bg-[#FAFAF9] text-[#1C1917] font-semibold hover:bg-[#E7E5E4] transition-colors cursor-pointer">
            Score 25 leads free
          </Link>
        </div>
      )}
    </div>
    </>
  );
}
