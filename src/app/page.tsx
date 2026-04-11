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
import { Button } from "@/components/patterns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/patterns";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">ConvertList</span>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button variant="primary" size="sm">Start free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50 opacity-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 text-sm font-medium mb-8 shadow-sm">
            <Zap className="w-4 h-4" />
            For indie founders launching SaaS
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6 tracking-tight">
            Turn your waitlist into
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">paying customers</span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Upload your waitlist. Our AI scores every lead by intent and fit.
            Generate personalized outreach in seconds. Stop guessing who to email first.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button variant="primary" size="lg">
                Analyze your waitlist free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <span className="text-sm text-slate-500">25 leads free, no credit card</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-slate-600 ml-3">Trusted by 500+ founders on IH, PH, and niche communities</span>
          </div>

          <a href="#how-it-works" className="inline-flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors animate-bounce">
            <span className="text-xs mb-2">See how it works</span>
            <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Workflow */}
      <section id="how-it-works" className="bg-slate-50 py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Three steps from waitlist to revenue
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
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
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Everything you need to convert waitlists
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Loved by indie founders
            </h2>
            <p className="text-slate-600">See what founders are saying about ConvertList</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              name="Sarah Chen"
              role="Founder, TaskFlow"
              avatar="SC"
              quote="Converted 12 waitlist signups to paid customers in the first week. The AI scoring is surprisingly accurate."
              rating={5}
            />
            <Testimonial
              name="Marcus Johnson"
              role="Founder, DataSync"
              avatar="MJ"
              quote="I was emailing everyone and getting 2% replies. After using ConvertList to focus on hot leads, I'm at 22%."
              rating={5}
            />
            <Testimonial
              name="Emily Rodriguez"
              role="Founder, LaunchPad"
              avatar="ER"
              quote="The personalized outreach generation is a game-changer. No more generic templates that get ignored."
              rating={5}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Link href="/sign-up">
            <Button variant="primary" size="lg">
              Analyze your waitlist free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-3">25 leads free, no credit card required</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-slate-600">Everything you need to know about ConvertList</p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How accurate is the AI scoring?"
              answer="Our AI analyzes domain quality, intent signals from signup notes, recency, and source. In our tests, hot leads (score ≥60) are 3x more likely to reply than cold leads. The scoring gets smarter as you mark conversions."
            />
            <FAQItem
              question="What data do I need to upload?"
              answer="Only email addresses are required. You can optionally include name, company, signup note, source, and signup date. The more data you provide, the more accurate the scoring."
            />
            <FAQItem
              question="Can I export the scored leads?"
              answer="Yes! After scoring, you can export your entire waitlist as a CSV with scores, segments, and AI-generated personalized emails for each lead."
            />
            <FAQItem
              question="How does the free trial work?"
              answer="The free plan includes 25 lead analyses. No credit card required. Upload your waitlist, see the scores and segments, and generate personalized outreach. Upgrade only when you need more."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Absolutely. Your data is encrypted at rest and in transit. We use industry-standard security practices and never share your data with third parties."
            />
          </div>
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
    <Card variant="default">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-base mb-4 leading-relaxed">{description}</p>
      <p className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-2 rounded-lg inline-block">{detail}</p>
    </Card>
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
    <Card variant="default" className="flex gap-4">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
        <Icon className="w-7 h-7 text-slate-700" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 mb-2 text-lg">{title}</h3>
        <p className="text-base text-slate-600 leading-relaxed">{description}</p>
      </div>
    </Card>
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
      className={`group relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
        highlight
          ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-2 border-slate-700 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          : "bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1"
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            Most Popular
          </div>
        </div>
      )}
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>{name}</h3>
        <p className={`text-sm mt-1 ${highlight ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
      </div>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>
          {price}
        </span>
        {note && (
          <span className={`text-sm ml-1 ${highlight ? "text-slate-400" : "text-slate-500"}`}>
            {note}
          </span>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <CheckCircle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                highlight ? "text-amber-400" : "text-green-600"
              }`}
            />
            <span className={highlight ? "text-slate-200" : "text-slate-700"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
          highlight
            ? "bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 hover:from-amber-500 hover:to-orange-500 shadow-lg"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function Testimonial({
  name,
  role,
  avatar,
  quote,
  rating,
}: {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}) {
  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-700 mb-6 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </div>
    </Card>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <details className="group">
        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="font-semibold text-slate-900">{question}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
        </summary>
        <div className="px-6 pb-6">
          <p className="text-slate-600 leading-relaxed">{answer}</p>
        </div>
      </details>
    </Card>
  );
}
