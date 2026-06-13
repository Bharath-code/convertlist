import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Mail,
  DollarSign,
  ArrowUpRight,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { DashboardSkeleton } from "./dashboard-client";
import { RepliesLive } from "@/components/replies/replies-live";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      waitlists: {
        include: {
          leads: {
            select: { id: true, segment: true, status: true, score: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return null;

  let totalLeads = 0;
  let totalHot = 0;
  let totalWarm = 0;
  let totalCold = 0;
  let contacted = 0;
  let replied = 0;
  let paid = 0;
  for (const w of user.waitlists) {
    totalLeads += w.totalLeads;
    for (const l of w.leads) {
      if (l.segment === "HOT") totalHot++;
      else if (l.segment === "WARM") totalWarm++;
      else if (l.segment === "COLD") totalCold++;
      if (l.status !== "UNCONTACTED") contacted++;
      if (l.status === "REPLIED" || l.status === "INTERESTED" || l.status === "PAID") replied++;
      if (l.status === "PAID") paid++;
    }
  }

  const conversionRate = totalLeads > 0 ? ((paid / totalLeads) * 100).toFixed(1) : "0.0";
  const planLabel =
    user.plan === "PRO"
      ? "Pro plan"
      : user.plan === "PRO_PLUS"
        ? "Pro Plus"
        : user.plan === "LAUNCH"
          ? "Lifetime"
          : "Free tier";

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-white">
      <div className="ambient-glow" aria-hidden="true" />
      <RepliesLive />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <header className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 mb-4">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {planLabel}
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-balance">
              {user.waitlists.length === 0
                ? "Your waitlist, scored."
                : "Your pipeline at a glance."}
            </h1>
            <p className="text-white/50 mt-2 max-w-lg">
              {user.waitlists.length === 0
                ? "Upload a CSV. AI scores every lead. We tell you who to email first."
                : `${user.waitlists.length} waitlist${user.waitlists.length !== 1 ? "s" : ""} · ${replied} replied · ${paid} converted`}
            </p>
          </div>
          <Link
            href="/upload"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New waitlist
            <span className="size-6 inline-flex items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        </header>

        {/* Stat cards — bento grid */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Total leads"
            value={totalLeads}
            accent="emerald"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Hot"
            value={totalHot}
            sub={totalLeads > 0 ? `${Math.round((totalHot / totalLeads) * 100)}%` : "0%"}
            accent="violet"
          />
          <StatCard
            icon={<Mail className="w-4 h-4" />}
            label="Contacted"
            value={contacted}
            sub={totalLeads > 0 ? `${Math.round((contacted / totalLeads) * 100)}%` : "0%"}
            accent="blue"
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Conversion"
            value={`${conversionRate}%`}
            sub={`${paid} paid`}
            accent="amber"
          />
        </div>

        {/* Recent waitlists */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-[0.2em]">
              Recent waitlists
            </h2>
            {user.waitlists.length > 0 && (
              <Link
                href="/connections"
                className="text-xs text-white/40 hover:text-white/80 transition-colors duration-300"
              >
                Connections →
              </Link>
            )}
          </div>

          {user.waitlists.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="divide-y divide-white/[0.06]">
                {user.waitlists.map((w) => {
                  const hot = w.leads.filter((l) => l.segment === "HOT").length;
                  return (
                    <Link
                      key={w.id}
                      href={
                        w.status === "COMPLETED"
                          ? `/results/${w.id}`
                          : `/processing/${w.id}`
                      }
                      className="group flex items-center justify-between p-5 hover:bg-white/[0.03] transition-colors duration-500"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white truncate">{w.name}</span>
                          <StatusChip status={w.status} />
                        </div>
                        <div className="text-xs text-white/40 mt-1.5 flex items-center gap-3">
                          <span className="tabular-nums">{w.totalLeads} leads</span>
                          <span className="text-white/20">·</span>
                          <span className="tabular-nums">{hot} hot</span>
                          <span className="text-white/20">·</span>
                          <span className="tabular-nums">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© 2026 ConvertList</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              Terms
            </Link>
            <a href="mailto:support@convertlist.ai" className="hover:text-white/60 transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accent: "emerald" | "violet" | "blue" | "amber";
}) {
  const accentClass = {
    emerald: "from-emerald-400/15 to-transparent",
    violet: "from-violet-400/15 to-transparent",
    blue: "from-sky-400/15 to-transparent",
    amber: "from-amber-400/15 to-transparent",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5">
      <div
        className={`pointer-events-none absolute -top-12 left-0 right-0 h-24 bg-gradient-to-b ${accentClass} blur-2xl`}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span className="text-white/60">{icon}</span>
          {label}
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-medium tracking-tight tabular-nums">{value}</span>
          {sub && <span className="text-xs text-white/40 mb-1 tabular-nums">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const meta: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: "ready", className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20" },
    PROCESSING: { label: "scoring", className: "bg-violet-400/10 text-violet-300 border-violet-400/20" },
    FAILED: { label: "failed", className: "bg-rose-400/10 text-rose-300 border-rose-400/20" },
    PENDING: { label: "pending", className: "bg-white/5 text-white/60 border-white/10" },
  };
  const m = meta[status] ?? meta.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] font-medium border ${m.className}`}
    >
      <span className="size-1 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-emerald-400/[0.05] to-transparent blur-3xl" />
      </div>
      <div className="relative p-12 text-center">
        <div className="size-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-emerald-300" />
        </div>
        <h3 className="text-xl font-medium tracking-tight text-white text-balance">
          Your first waitlist takes 60 seconds.
        </h3>
        <p className="text-sm text-white/50 mt-2 max-w-md mx-auto">
          Drop in a CSV, paste a list, or just give us a name and start from scratch.
        </p>
        <Link
          href="/upload"
          className="group inline-flex items-center gap-2 mt-6 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Upload a waitlist
          <span className="size-6 inline-flex items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
