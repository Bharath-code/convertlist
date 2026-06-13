import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Score your first 25 leads. No card required.",
    limits: "25 leads (one-time)",
    features: [
      "AI scoring (Hot/Warm/Cold)",
      "CSV upload + paste emails",
      "Outreach message generation",
      "Manual reply tracking",
    ],
    cta: "Start free",
    href: "/upload",
    highlight: false,
    icon: Sparkles,
  },
  {
    id: "launch",
    name: "Launch",
    price: "$97",
    cadence: "lifetime",
    description: "One-time. The indie-founder play. Lock in forever.",
    limits: "500 leads (one-time)",
    features: [
      "Everything in Free",
      "Reply detection (email forwarding + Instantly)",
      "Slack/Discord notifications",
      "3-step email sequences",
      "Up to 500 leads",
    ],
    cta: "Get lifetime access",
    href: "/api/payments/checkout?plan=launch",
    highlight: true,
    badge: "Most Popular",
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    cadence: "/month",
    description: "For active converters. Cancel anytime.",
    limits: "500 leads/month",
    features: [
      "Everything in Launch",
      "Up to 500 leads / month",
      "5-step email sequences",
      "Auto-classify replies (interested/unsubscribe/OOO)",
      "Live reply feed (SSE)",
    ],
    cta: "Get Pro",
    href: "/api/payments/checkout?plan=pro",
    highlight: false,
    icon: Zap,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: "$79",
    cadence: "/month",
    description: "One-click send. Power-user features.",
    limits: "Unlimited leads",
    features: [
      "Everything in Pro",
      "Unlimited leads",
      "Instantly.ai one-click send",
      "Priority AI scoring",
      "Premium support",
    ],
    cta: "Get Pro+",
    href: "/api/payments/checkout?plan=pro_plus",
    highlight: false,
    icon: Building2,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$199",
    cadence: "/month",
    description: "Manage client waitlists. White-label.",
    limits: "10 client waitlists",
    features: [
      "Everything in Pro+",
      "Up to 10 client waitlists",
      "White-label dashboard",
      "Multi-tenant isolation",
      "Onboarding call",
    ],
    cta: "Talk to us",
    href: "mailto:support@convertlist.ai?subject=Agency%20plan",
    highlight: false,
    icon: Building2,
  },
];

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">ConvertList</h1>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/connections" className="text-slate-600 hover:text-slate-900">
              Connections
            </Link>
            {userId ? (
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
            ) : (
              <Link href="/sign-in" className="text-slate-600 hover:text-slate-900">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">
            <Sparkles className="w-3 h-3" />
            New: live reply detection
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Convert your waitlist into paying customers.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            AI scores your leads, writes the outreach, sends it, and pings you the second
            someone replies. <span className="text-slate-900 font-medium">$97 once, or $29/mo.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl bg-white p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  tier.highlight
                    ? "border-2 border-slate-900 shadow-xl scale-[1.02]"
                    : "border border-slate-200"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] font-medium px-3 py-1 rounded-full">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                    {tier.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 mb-4 min-h-[2.5em]">{tier.description}</p>

                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-slate-500 text-sm ml-1">{tier.cadence}</span>
                </div>

                <p className="text-xs text-slate-500 mb-5">{tier.limits}</p>

                <Link
                  href={tier.href}
                  className={`block text-center py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                    tier.highlight
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {tier.cta}
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            All plans include unlimited waitlists, 99.9% uptime, and our 30-day
            money-back guarantee.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Need something custom?{" "}
            <a href="mailto:support@convertlist.ai" className="underline">
              Talk to us
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
