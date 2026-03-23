import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic lead scoring",
    limits: "50 leads",
    features: [
      "50 lead analyses",
      "CSV upload + paste",
      "Basic scoring (Hot/Warm/Cold)",
      "1 waitlist",
    ],
    cta: "Start Free",
    href: "/upload",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9/mo",
    description: "For indie hackers serious about conversions",
    limits: "2,000 leads",
    features: [
      "2,000 lead analyses/mo",
      "3-step email sequences",
      "Basic reply detection",
      "Priority processing",
      "Export results",
    ],
    cta: "Get Pro",
    href: "/api/payments/checkout?plan=pro",
    highlight: false,
  },
  {
    name: "Pro+",
    price: "$29/mo",
    description: "Unlimited leads and full features",
    limits: "Unlimited leads",
    features: [
      "Unlimited leads",
      "5-step email sequences",
      "Full reply detection",
      "Instantly integration",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Get Pro+",
    href: "/api/payments/checkout?plan=pro_plus",
    highlight: true,
  },
  {
    name: "Lifetime",
    price: "$49",
    description: "One-time payment, forever access",
    limits: "Everything in Pro+",
    features: [
      "All Pro+ features",
      "Lifetime access",
      "No monthly fees",
      "Early access to new features",
    ],
    cta: "Get Lifetime",
    href: "/api/payments/checkout?plan=lifetime",
    highlight: false,
  },
];

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">ConvertList</h1>
          {userId ? (
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
          ) : (
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`card ${
                tier.highlight
                  ? "border-2 border-slate-900 relative"
                  : "border border-slate-200"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-slate-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  {tier.price}
                </span>
                {tier.price !== "$0" && (
                  <span className="text-slate-500 text-sm ml-1">
                    {tier.price.includes("/") ? "month" : "one-time"}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-4">{tier.limits}</p>

              <Link
                href={tier.href}
                className={`block text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  tier.highlight
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="mt-6 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
