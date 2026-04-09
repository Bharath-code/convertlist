import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Zap,
  Users,
  TrendingUp,
  Mail,
  CheckCircle,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">ConvertList</span>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Pricing
            </a>
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-primary text-sm">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-6">
          <Zap className="w-3 h-3" />
          For indie founders launching SaaS
        </div>

        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Turn your waitlist into
          <br />
          <span className="text-slate-900">paying customers</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your waitlist. Our AI scores every lead by intent and fit.
          Generate personalized outreach in seconds. Stop guessing who to email first.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/sign-up"
            className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
          >
            Analyze your waitlist free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <span className="text-sm text-slate-500">25 leads free, no credit card</span>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-sm text-slate-600 ml-2">Trusted by founders launching on IH, PH, and niche communities</span>
        </div>

        <a href="#how-it-works" className="inline-flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors">
          <span className="text-xs mb-1">See how it works</span>
          <ArrowDown className="w-4 h-4" />
        </a>
      </section>

      {/* Workflow */}
      <section id="how-it-works" className="bg-slate-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Three steps from waitlist to revenue
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              No manual analysis. No spreadsheets. Just upload and let the AI surface your best leads.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number={1}
              title="Upload your waitlist"
              description="Drop a CSV or paste emails. We handle the rest — dedup, parsing, normalization."
              detail="email, name, company, signup note, source, date — all optional except email"
            />
            <Step
              number={2}
              title="AI scores every lead"
              description="Gemini analyzes domain quality, intent signals, recency, and source to score 0–90."
              detail="Hot ≥60 · Warm 35-59 · Cold <35"
            />
            <Step
              number={3}
              title="Generate outreach instantly"
              description="One click generates personalized email subject + body for any lead. Export and send."
              detail="AI-powered personalization using signup notes and company data"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to convert waitlists
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Feature
              icon={TrendingUp}
              title="AI Lead Scoring"
              description="Batch-processes 50 leads per API call using Gemini 2.5 Flash. Every lead gets a score 0-90 with a plain-English reason."
            />
            <Feature
              icon={Users}
              title="Hot / Warm / Cold Segmentation"
              description="Automatically segments your list. Focus on Hot leads first — they're 3x more likely to reply."
            />
            <Feature
              icon={Mail}
              title="Personalized Outreach Generation"
              description="Generate subject lines and email body personalized to each lead's signup note and company. Not generic templates."
            />
            <Feature
              icon={Zap}
              title="Contact Tracker Flywheel"
              description="Mark leads as Contacted → Replied → Interested → Paid. Every paid conversion improves your scoring intuition."
            />
          </div>
        </div>
      </section>

      {/* Scoring Model */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How scoring works</h2>
            <p className="text-slate-400">
              Four signals, weighted by impact on conversion likelihood
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <ScoreRow signal="Domain quality" max={25} description="Company domain +20 · Personal email +10 · Disposable +2" />
            <ScoreRow signal="Intent signal (AI)" max={30} description="Urgent pain 25-30 · Specific use case 15-25 · Vague 5-10" />
            <ScoreRow signal="Recency" max={20} description="<7 days +20 · <30 days +15 · <90 days +10" />
            <ScoreRow signal="Source" max={15} description="Referral +15 · Niche community +10 · Launch platform +7" />
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">
            Max score: 90 &nbsp;·&nbsp; Hot ≥60 &nbsp;·&nbsp; Warm 35-59 &nbsp;·&nbsp; Cold &lt;35
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple pricing</h2>
            <p className="text-slate-600">Start free. Upgrade when you need more leads.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <PricingCard
              name="Free"
              price="$0"
              description="Get started with basic scoring"
              features={["25 lead analyses", "CSV + paste import", "Hot/Warm/Cold segmentation", "AI outreach generation"]}
              cta="Start free"
              href="/sign-up"
            />
            <PricingCard
              name="Pro"
              price="$29/mo"
              description="For founders ready to scale"
              features={["500 leads/mo", "3-step email sequences", "Basic reply detection", "Priority processing"]}
              cta="Get Pro"
              href="/sign-up"
              highlight={false}
            />
            <PricingCard
              name="Pro+"
              price="$79/mo"
              description="Unlimited everything"
              features={["Unlimited leads", "5-step email sequences", "Full reply detection", "Instantly integration"]}
              cta="Get Pro+"
              href="/sign-up"
              highlight={true}
            />
            <PricingCard
              name="Launch"
              price="$97"
              description="One payment, forever"
              features={["All Pro+ features", "Lifetime access", "No monthly fees", "Early feature access"]}
              cta="Get Launch"
              href="/sign-up"
              highlight={false}
              note="one-time"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Your waitlist has paying customers in it.
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Most founders email their whole list and get 2% replies.
            Score first, email the right people, get 20%.
          </p>
          <Link href="/sign-up" className="btn-primary px-8 py-3 text-lg inline-flex items-center gap-2">
            Analyze your waitlist free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-500 mt-3">25 leads free, no credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-sm text-slate-500">ConvertList — Waitlist Conversion Assistant</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900">Pricing</Link>
            <Link href="/sign-in" className="text-sm text-slate-500 hover:text-slate-900">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  detail,
}: {
  number: number;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-3">{description}</p>
      <p className="text-xs text-slate-400 font-mono">{detail}</p>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-6 rounded-xl border border-slate-200">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function ScoreRow({
  signal,
  max,
  description,
}: {
  signal: string;
  max: number;
  description: string;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{signal}</span>
        <span className="text-xs text-slate-400">max {max}</span>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  href,
  highlight,
  note,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  note?: string;
}) {
  return (
    <div
      className={`rounded-xl p-6 flex flex-col ${
        highlight
          ? "bg-slate-900 text-white border-2 border-slate-900"
          : "bg-white border border-slate-200"
      }`}
    >
      {highlight && (
        <div className="text-xs font-medium text-amber-400 mb-3 flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400" /> Most Popular
        </div>
      )}
      <div className="mb-1">
        <h3 className={`font-bold ${highlight ? "text-white" : "text-slate-900"}`}>{name}</h3>
        <p className={`text-sm ${highlight ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
      </div>
      <div className="my-4">
        <span className={`text-3xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>
          {price}
        </span>
        {note && (
          <span className={`text-sm ml-1 ${highlight ? "text-slate-400" : "text-slate-500"}`}>
            {note}
          </span>
        )}
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                highlight ? "text-amber-400" : "text-green-600"
              }`}
            />
            <span className={highlight ? "text-slate-300" : "text-slate-600"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          highlight
            ? "bg-white text-slate-900 hover:bg-slate-100"
            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
