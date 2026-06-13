"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { launchOutreachForWaitlist } from "@/app/actions/launch-outreach";
import {
  Search,
  Download,
  RefreshCw,
  Plus,
  Star,
  Users,
  Flame,
  Target,
  Rocket,
  DollarSign,
  Mail,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Zap,
  ChevronRight,
  X,
  Sun,
  Snowflake,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { LeadCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/patterns";
import EnrichmentModal from "./enrichment-modal";
import SequenceBuilder from "./sequences/sequence-builder";
import type { EnrichmentAnswers } from "./enrichment-modal";
import PricingIntelligenceDashboard from "@/components/pricing-intelligence-dashboard";
import LaunchDayCommandCenter from "@/components/launch-day-command-center";
import ViralityAnalyticsDashboard from "@/components/virality-analytics-dashboard";
import CompetitorInsightsDashboard from "@/components/competitor-insights-dashboard";
import { StaggerContainer, SlideUp } from "@/components/motion";
import { motion } from "framer-motion";

type Lead = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  signupNote: string | null;
  source: string | null;
  score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  segment: "HOT" | "WARM" | "COLD";
  status: "UNCONTACTED" | "CONTACTED" | "REPLIED" | "INTERESTED" | "PAID";
  // Enrichment fields (will be available after Prisma migration)
  linkedinUrl?: string | null;
  companySize?: string | null;
  techStack?: string | null;
  fundingStatus?: string | null;
  socialProofScore?: number | null;
  // Clustering fields
  useCaseCluster?: string | null;
  painPointTribe?: string | null;
  // Competitor Cross-Reference fields
  detectedCompetitors?: string | null;
  competitorFeatures?: string | null;
  switchingCost?: string | null;
  competitorConfidence?: number | null;
  // Referral Network Mapper fields
  relatedLeads?: string | null;
  companyRelationships?: string | null;
  communityOverlap?: string | null;
  influenceScore?: number | null;
};

type Props = {
  waitlist: { id: string; name: string; totalLeads: number };
  hotLeads: Lead[];
  warmLeads: Lead[];
  coldLeads: Lead[];
  top10Percent: number;
  userPlan?: string;
};

const statusColors: Record<string, string> = {
  UNCONTACTED: "bg-slate-100 text-slate-600",
  CONTACTED: "bg-blue-100 text-blue-700",
  REPLIED: "bg-green-100 text-green-700",
  INTERESTED: "bg-purple-100 text-purple-700",
  PAID: "bg-yellow-100 text-yellow-700",
};
// (kept for legacy; LeadCard uses semantic inline classes)

export default function ResultsClient({
  waitlist,
  hotLeads,
  warmLeads,
  coldLeads,
  top10Percent,
  userPlan = "FREE",
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"LEADS" | "INSIGHTS" | "COMPETITORS" | "LAUNCH">("LEADS");
  const [segmentFilter, setSegmentFilter] = useState<"ALL" | "HOT" | "WARM" | "COLD">("ALL");
  const [insightView, setInsightView] = useState<"TRIBES" | "PRICING" | "VIRALITY">("TRIBES");
  const [focusedTab, setFocusedTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ["LEADS", "INSIGHTS", "COMPETITORS", "LAUNCH"] as const;

  const handleTabKeyDown = (e: React.KeyboardEvent, tabIndex: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusedTab((tabIndex + 1) % tabs.length);
      setActiveTab(tabs[(tabIndex + 1) % tabs.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusedTab((tabIndex - 1 + tabs.length) % tabs.length);
      setActiveTab(tabs[(tabIndex - 1 + tabs.length) % tabs.length]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tabs[tabIndex]);
    }
  };
  const [search, setSearch] = useState("");
  const [showTop10, setShowTop10] = useState(false);
  const [enrichingLead, setEnrichingLead] = useState<Lead | null>(null);
  const [showSequenceBuilder, setShowSequenceBuilder] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [demoScriptLead, setDemoScriptLead] = useState<Lead | null>(null);
  const [demoScript, setDemoScript] = useState<string | null>(null);
  const [loadingDemoScript, setLoadingDemoScript] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [hotLeads, warmLeads, coldLeads]);

  const filteredLeads = useMemo(() => {
    const source = showTop10 ? hotLeads.slice(0, top10Percent) : getCurrentLeads();
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (l) =>
        l.email.toLowerCase().includes(q) ||
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q)
    );
  }, [showTop10, hotLeads, top10Percent, search, activeTab, warmLeads, coldLeads]);

  // Generate demo script when lead is selected
  useEffect(() => {
    if (demoScriptLead) {
      setLoadingDemoScript(true);
      setDemoScript(null);
      fetch(`/api/leads/${demoScriptLead.id}/demo-script`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          setDemoScript(data.demoScript);
        })
        .catch((error) => {
          console.error("Failed to generate demo script:", error);
          toast.error("Failed to generate demo script");
        })
        .finally(() => {
          setLoadingDemoScript(false);
        });
    }
  }, [demoScriptLead]);

  const exportToCSV = () => {
    const allLeads = [...hotLeads, ...warmLeads, ...coldLeads];
    const headers = ["email", "name", "company", "score", "confidence", "segment", "status", "source", "reason"];
    const csv = [
      headers.join(","),
      ...allLeads.map((lead) =>
        headers.map((h) => {
          const value = (lead as Record<string, unknown>)[h];
          const strValue = typeof value === 'string' ? value : String(value ?? '');
          return `"${strValue.replace(/"/g, '""')}"`;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${waitlist.name.replace(/\s+/g, "-")}-leads.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exported to CSV");
  };

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    const currentLeads = showTop10 ? hotLeads.slice(0, top10Percent) : getCurrentLeads();
    if (selectedLeads.size === currentLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(currentLeads.map((l) => l.id)));
    }
  };

  const bulkMarkStatus = async (newStatus: string) => {
    if (selectedLeads.size === 0) return;

    const loadingToast = toast.loading(`Updating ${selectedLeads.size} leads...`);
    try {
      await Promise.all(
        Array.from(selectedLeads).map((id) =>
          fetch(`/api/leads/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      toast.success(`Marked ${selectedLeads.size} leads as ${newStatus}`, { id: loadingToast });
      setSelectedLeads(new Set());
      router.refresh();
    } catch {
      toast.error("Failed to update leads", { id: loadingToast });
    }
  };

  const launchInstantlyCampaign = async () => {
    if (selectedLeads.size === 0) return;

    const loadingToast = toast.loading("Launching Instantly.ai campaign...");
    try {
      const result = await launchOutreachForWaitlist({
        waitlistId: waitlist.id,
        leadIds: Array.from(selectedLeads),
      });

      if (!result.ok) {
        if (result.error === "Unauthorized") {
          toast.error("Sign in to launch campaigns", { id: loadingToast });
          return;
        }
        throw new Error(result.error || "Failed to launch campaign");
      }

      toast.success(
        `Campaign launched! ${result.leadCount} emails queued · replies will appear live`,
        { id: loadingToast, duration: 6000 }
      );
      setSelectedLeads(new Set());
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to launch campaign";
      toast.error(message, { id: loadingToast });
    }
  };

  const getCurrentLeads = (): Lead[] => {
    if (segmentFilter === "HOT") return hotLeads;
    if (segmentFilter === "WARM") return warmLeads;
    if (segmentFilter === "COLD") return coldLeads;
    return [...hotLeads, ...warmLeads, ...coldLeads];
  };

  const isFreeUser = userPlan === "FREE";
  const nearLimit = isFreeUser && waitlist.totalLeads >= 20;
  const needsInstantly = userPlan === "FREE" || userPlan === "LAUNCH";

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-white">
      <div className="ambient-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
      {nearLimit && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-100">
              You&apos;re at <span className="tabular-nums">{waitlist.totalLeads}</span>/25 leads on the free plan
            </p>
            <p className="text-sm text-amber-200/70 mt-0.5">
              $97 lifetime gets you 500 leads, 3-step sequences, and live reply detection. Pro is $29/mo for 500/mo + 5-step.
            </p>
          </div>
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 hover:bg-amber-300/20 px-3.5 py-1.5 text-xs font-medium text-amber-100 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
          >
            See plans
            <ArrowUpRight className="w-3 h-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {needsInstantly && hotLeads.length > 0 && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">
              <span className="tabular-nums">{hotLeads.length}</span> hot {hotLeads.length === 1 ? "lead is" : "leads are"} waiting to be emailed
            </p>
            <p className="text-sm text-white/60 mt-0.5">
              One-click Instantly send is on Pro+ ($79/mo). Or <Link href="/connections" className="underline decoration-white/30 hover:text-white">paste your Instantly key</Link> to launch from any plan.
            </p>
          </div>
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Upgrade
            <ArrowUpRight className="w-3 h-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Waitlist
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-balance">
            {waitlist.name}
          </h1>
          <p className="text-white/50 mt-2 text-sm tabular-nums">
            <span className="text-white/80 font-medium">{waitlist.totalLeads}</span> leads · {hotLeads.length} hot · {warmLeads.length} warm · {coldLeads.length} cold
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            aria-label="Export all leads to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
          >
            Dashboard
          </Link>
          <Link
            href="/upload"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New upload
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 mb-6">
        {/* Bulk Action Bar */}
        {selectedLeads.size > 0 && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-3 flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm font-medium text-white">
              <span className="tabular-nums">{selectedLeads.size}</span> selected
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mr-1">Mark</span>
              {(["CONTACTED", "REPLIED", "INTERESTED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => bulkMarkStatus(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-white/80 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]"
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
              <span className="size-px h-4 bg-white/10 mx-1" />
              <button
                onClick={launchInstantlyCampaign}
                className="group text-xs px-3 py-1.5 rounded-full bg-emerald-400 text-black font-medium flex items-center gap-1.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.97]"
              >
                <Mail className="w-3 h-3" />
                Send via Instantly
              </button>
              <button
                onClick={() => setSelectedLeads(new Set())}
                className="text-xs px-3 py-1.5 rounded-full text-white/40 hover:text-white transition-colors duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, or company..."
              className="w-full rounded-full border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              aria-label="Search leads"
            />
          </div>
          <button
            onClick={() => setShowTop10(!showTop10)}
            className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
              showTop10
                ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/70 hover:text-white"
            }`}
            aria-label="Toggle top 10 percent view"
          >
            <Star className="w-3.5 h-3.5" />
            Top 10%
          </button>
          <button
            onClick={() => setShowSequenceBuilder(true)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            aria-label="Create email sequence"
          >
            <Plus className="w-3.5 h-3.5" />
            Sequence
          </button>
        </div>

        {!showTop10 && (
          <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1 gap-1">
            {tabs.map((tab, i) => {
              const active = activeTab === tab;
              const Icon =
                tab === "LEADS" ? Users
                : tab === "INSIGHTS" ? Flame
                : tab === "COMPETITORS" ? Target
                : Rocket;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  onKeyDown={(e) => handleTabKeyDown(e, i)}
                  className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    active ? "text-black" : "text-white/50 hover:text-white/80"
                  }`}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`panel-${tab.toLowerCase()}`}
                  tabIndex={focusedTab === i ? 0 : -1}
                >
                  {active && (
                    <motion.span
                      layoutId="results-tab"
                      className="absolute inset-0 rounded-full bg-white"
                      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Segment Filter for Leads Tab */}
        {activeTab === "LEADS" && !showTop10 && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            {(["ALL", "HOT", "WARM", "COLD"] as const).map((seg) => {
              const count = seg === "ALL" ? hotLeads.length + warmLeads.length + coldLeads.length
                : seg === "HOT" ? hotLeads.length
                : seg === "WARM" ? warmLeads.length
                : coldLeads.length;
              const active = segmentFilter === seg;
              const accent =
                seg === "HOT" ? "text-rose-300"
                : seg === "WARM" ? "text-amber-300"
                : seg === "COLD" ? "text-sky-300"
                : "text-white/60";
              return (
                <button
                  key={seg}
                  onClick={() => setSegmentFilter(seg)}
                  className={`group relative inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    active
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-white/40 hover:text-white/70 border border-transparent"
                  }`}
                  role="tab"
                  aria-selected={active}
                >
                  {active && (
                    <span className={`size-1.5 rounded-full ${accent === "text-white/60" ? "bg-white/60" : accent.replace("text-", "bg-")}`} />
                  )}
                  {seg === "ALL" ? "All" : seg.charAt(0) + seg.slice(1).toLowerCase()}
                  <span className="text-white/40 tabular-nums">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Insight View Selector for Insights Tab */}
        {activeTab === "INSIGHTS" && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
            {(["TRIBES", "PRICING", "VIRALITY"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setInsightView(view)}
                className={`relative px-3 py-1 text-[11px] font-medium rounded-full transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  insightView === view
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-white/40 hover:text-white/70 border border-transparent"
                }`}
                role="tab"
                aria-selected={insightView === view}
              >
                {view === "TRIBES" ? "Tribes" : view === "PRICING" ? "Pricing" : "Virality"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3" role="tabpanel" id={activeTab === "LEADS" ? "panel-leads" : activeTab === "INSIGHTS" ? "panel-insights" : activeTab === "COMPETITORS" ? "panel-competitors" : "panel-launch"}>
        {isLoading ? (
          <>
            <div className="flex gap-3 mb-2 items-center">
              <div className="w-4 h-4 rounded border-slate-300 bg-slate-200 animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-4 h-4 rounded border-slate-300 mt-1 bg-slate-200 animate-pulse" />
                <LeadCardSkeleton />
              </div>
            ))}
          </>
        ) : activeTab === "INSIGHTS" ? (
          insightView === "TRIBES" ? (
            <TribesView
              allLeads={[...hotLeads, ...warmLeads, ...coldLeads]}
              onEnrich={(lead) => setEnrichingLead(lead)}
              onCopyEmail={copyEmail}
              onGenerateDemoScript={(lead) => setDemoScriptLead(lead)}
            />
          ) : insightView === "PRICING" ? (
            <PricingIntelligenceDashboard waitlistId={waitlist.id} />
          ) : (
            <ViralityAnalyticsDashboard waitlistId={waitlist.id} />
          )
        ) : activeTab === "COMPETITORS" ? (
          <CompetitorView waitlistId={waitlist.id} />
        ) : activeTab === "LAUNCH" ? (
          <LaunchTimingView waitlistId={waitlist.id} />
        ) : filteredLeads.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-16 text-center">
            <p className="text-white/50 text-sm">
              {search ? "No leads match your search" : "No leads found"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-3 items-center px-1">
              <button
                onClick={selectAll}
                className="group flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors duration-300"
                aria-label="Select all leads"
              >
                <span
                  className={`size-4 rounded-md border flex items-center justify-center transition-all duration-300 ${
                    selectedLeads.size === filteredLeads.length && filteredLeads.length > 0
                      ? "bg-white border-white"
                      : "border-white/20 group-hover:border-white/40"
                  }`}
                >
                  {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 && (
                    <Check className="w-3 h-3 text-black" />
                  )}
                </span>
                <span className="tabular-nums">
                  {selectedLeads.size > 0
                    ? `${selectedLeads.size} selected`
                    : `${filteredLeads.length} leads`}
                </span>
              </button>
            </div>
            <StaggerContainer>
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="flex items-stretch gap-3">
                  <button
                    onClick={() => toggleSelectLead(lead.id)}
                    className="group self-stretch flex items-center pt-5"
                    aria-label={`Select ${lead.email}`}
                  >
                    <span
                      className={`size-4 rounded-md border flex items-center justify-center transition-all duration-300 ${
                        selectedLeads.has(lead.id)
                          ? "bg-white border-white"
                          : "border-white/20 group-hover:border-white/40"
                      }`}
                    >
                      {selectedLeads.has(lead.id) && (
                        <Check className="w-3 h-3 text-black" />
                      )}
                    </span>
                  </button>
                  <LeadCard
                    lead={lead}
                    onEnrich={() => setEnrichingLead(lead)}
                    onCopyEmail={() => copyEmail(lead.email)}
                    onGenerateDemoScript={() => setDemoScriptLead(lead)}
                  />
                </div>
              ))}
            </StaggerContainer>
          </>
        )}
      </div>

      {enrichingLead && (
        <EnrichmentModal
          lead={enrichingLead}
          onClose={() => setEnrichingLead(null)}
          onSubmit={async (answers) => {
            try {
              const res = await fetch(`/api/leads/${enrichingLead.id}/enrich`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId: enrichingLead.id, answers }),
              });
              if (res.ok) {
                router.refresh();
              }
            } catch (e) {
              // Enrichment failed
            }
          }}
        />
      )}

      {showSequenceBuilder && (
        <SequenceBuilder
          waitlistId={waitlist.id}
          onClose={() => setShowSequenceBuilder(false)}
          onSave={async (name, steps) => {
            await fetch("/api/sequences", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ waitlistId: waitlist.id, name, steps }),
            });
            setShowSequenceBuilder(false);
          }}
        />
      )}

      {demoScriptLead && (
        <DemoScriptModal
          lead={demoScriptLead}
          script={demoScript}
          loading={loadingDemoScript}
          onClose={() => {
            setDemoScriptLead(null);
            setDemoScript(null);
          }}
          onCopy={() => {
            if (demoScript) {
              navigator.clipboard.writeText(demoScript);
              toast.success("Demo script copied to clipboard");
            }
          }}
          onFeedback={(positive: boolean) => {
            // TODO: Track feedback in analytics
            toast.success(positive ? "Thanks for the feedback!" : "We'll improve next time");
            setDemoScriptLead(null);
            setDemoScript(null);
          }}
        />
      )}
      </div>
    </div>
  );
}

function LeadCard({ lead, onEnrich, onCopyEmail, onGenerateDemoScript }: { lead: Lead; onEnrich: () => void; onCopyEmail: () => void; onGenerateDemoScript: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    await onCopyEmail();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: typeof status) => {
    if (newStatus === status || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } catch {
      console.error("Failed to update status");
    }
    setUpdating(false);
  };

  const nextStatus: Record<string, typeof status | null> = {
    UNCONTACTED: "CONTACTED",
    CONTACTED: "REPLIED",
    REPLIED: "INTERESTED",
    INTERESTED: "PAID",
    PAID: null,
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 p-4 flex-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-white truncate">
              {lead.name || lead.email.split("@")[0]}
            </span>
            {lead.name && (
              <span className="text-sm text-white/40 truncate tabular-nums">({lead.email})</span>
            )}
            {!lead.name && (
              <button
                onClick={handleCopyEmail}
                className="text-white/30 hover:text-white/70 transition-colors duration-300"
                aria-label={`Copy ${lead.email} to clipboard`}
                title="Copy email"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {lead.company && (
            <p className="text-sm text-white/60 mb-2">{lead.company}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tabular-nums border ${
                lead.segment === "HOT"
                  ? "bg-rose-400/10 text-rose-200 border-rose-400/20"
                  : lead.segment === "WARM"
                    ? "bg-amber-400/10 text-amber-200 border-amber-400/20"
                    : "bg-sky-400/10 text-sky-200 border-sky-400/20"
              }`}
            >
              {lead.score}
            </span>
            <span
              className={`inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-medium px-1.5 py-0.5 rounded-full border ${
                lead.confidence === "HIGH"
                  ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                  : lead.confidence === "MEDIUM"
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                    : "bg-white/5 text-white/50 border-white/10"
              }`}
            >
              {lead.confidence}
            </span>
            <span className="text-xs text-white/40">{lead.reason}</span>

            {/* Enrichment badges */}
            {lead.companySize && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/60">
                {lead.companySize}
              </span>
            )}
            {lead.techStack && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/60">
                {lead.techStack.split(',').slice(0, 2).join(', ')}
              </span>
            )}
            {lead.fundingStatus && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                {lead.fundingStatus}
              </span>
            )}
            {lead.socialProofScore && lead.socialProofScore > 50 && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-300 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> {lead.socialProofScore}
              </span>
            )}

            {/* Competitor badges */}
            {lead.detectedCompetitors && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-orange-400/20 bg-orange-400/10 text-orange-300 flex items-center gap-1">
                <Target className="w-2.5 h-2.5" /> {JSON.parse(lead.detectedCompetitors).slice(0, 2).join(', ')}
              </span>
            )}

            {/* Network relationship badges */}
            {lead.influenceScore && lead.influenceScore > 70 && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-300 flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> Influencer {lead.influenceScore}
              </span>
            )}
            {lead.relatedLeads && JSON.parse(lead.relatedLeads).length > 0 && (
              <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> {JSON.parse(lead.relatedLeads).length} connections
              </span>
            )}
          </div>

          {expanded && (
            <div
              id={`lead-details-${lead.id}`}
              className="mt-3 pt-3 border-t border-white/10 space-y-2"
              role="region"
              aria-label="Lead details"
            >
              {lead.signupNote && (
                <p className="text-sm text-white/70 italic">
                  &ldquo;{lead.signupNote}&rdquo;
                </p>
              )}
              {lead.source && (
                <p className="text-xs text-white/40">Source: {lead.source}</p>
              )}
              {/* Clustering info */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {lead.useCaseCluster && (
                  <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    {lead.useCaseCluster}
                  </span>
                )}
                {lead.painPointTribe && (
                  <span className="text-[10px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border border-orange-400/20 bg-orange-400/10 text-orange-300">
                    {lead.painPointTribe}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onGenerateDemoScript}
            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/60 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            title="Generate AI demo script"
          >
            <FileText className="w-3 h-3" />
            Script
          </button>
          <button
            onClick={onEnrich}
            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-amber-300/30 bg-amber-300/[0.08] hover:bg-amber-300/[0.16] text-amber-200 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
            title="Improve score accuracy"
          >
            <Zap className="w-3 h-3" />
            Improve
          </button>

          <span
            className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 rounded-full border ${
              status === "REPLIED"
                ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                : status === "INTERESTED"
                  ? "bg-violet-400/10 text-violet-300 border-violet-400/20"
                  : status === "PAID"
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                    : status === "CONTACTED"
                      ? "bg-sky-400/10 text-sky-300 border-sky-400/20"
                      : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            <span className={`size-1 rounded-full ${
              status === "REPLIED" ? "bg-emerald-400"
                : status === "INTERESTED" ? "bg-violet-400"
                : status === "PAID" ? "bg-amber-400"
                : status === "CONTACTED" ? "bg-sky-400"
                : "bg-white/30"
            }`} />
            {status.toLowerCase()}
          </span>

          {nextStatus[status] && (
            <button
              onClick={() => handleStatusChange(nextStatus[status]!)}
              disabled={updating}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white text-black font-medium hover:scale-[1.02] active:scale-[0.97] disabled:opacity-30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              {updating ? "..." : `→ ${nextStatus[status]?.toLowerCase()}`}
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="size-7 inline-flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors duration-300 active:scale-[0.96]"
            aria-expanded={expanded}
            aria-controls={`lead-details-${lead.id}`}
            aria-label={expanded ? "Collapse lead details" : "Expand lead details"}
          >
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoScriptModal({
  lead,
  script,
  loading,
  onClose,
  onCopy,
  onFeedback,
}: {
  lead: Lead;
  script: string | null;
  loading: boolean;
  onClose: () => void;
  onCopy: () => void;
  onFeedback: (positive: boolean) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-1.5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="rounded-[1.625rem] border border-white/[0.06] bg-[#0a0a0a] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                  AI demo script
                </div>
                <h3 className="text-xl font-medium tracking-tight text-white text-balance">
                  {lead.name || lead.email.split("@")[0]}
                </h3>
                {lead.company && (
                  <p className="text-sm text-white/50 mt-0.5">{lead.company}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-300 active:scale-[0.96]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-white/50">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating demo script…
                </div>
              ) : script ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 max-h-[50vh] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-white/85 leading-relaxed font-sans">
{script}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-white/50">
                  No demo script available
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onFeedback(true)}
                  className="size-9 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] hover:bg-emerald-400/10 hover:border-emerald-400/30 text-white/50 hover:text-emerald-300 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]"
                  title="Helpful"
                  aria-label="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onFeedback(false)}
                  className="size-9 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] hover:bg-rose-400/10 hover:border-rose-400/30 text-white/50 hover:text-rose-300 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]"
                  title="Not helpful"
                  aria-label="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={onCopy}
                disabled={!script}
                className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy script
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LaunchTimingView({ waitlistId }: { waitlistId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/waitlist/${waitlistId}/launch-timing`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch launch timing data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      Loading launch timing data…
    </div>
  );
  if (!data) return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      No launch timing data available
    </div>
  );

  return (
    <LaunchDayCommandCenter
      readinessScore={data.launchReadinessScore}
      recommendedLaunchDate={data.recommendedLaunchDate ? new Date(data.recommendedLaunchDate) : undefined}
      peakEngagementDay={data.engagementHeatmap?.peakDay}
      peakEngagementHour={data.engagementHeatmap?.peakHour}
      season={data.seasonalityData?.season}
      recommendations={data.seasonalityData?.recommendations}
    />
  );
}

function CompetitorView({ waitlistId }: { waitlistId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/waitlist/${waitlistId}/competitors`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch competitor data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      Loading competitor data…
    </div>
  );
  if (!data) return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
      No competitor data available
    </div>
  );

  return (
    <CompetitorInsightsDashboard
      competitorStats={data.competitorStats}
      featureGaps={data.featureGaps}
      switchingCostStats={data.switchingCostStats}
    />
  );
}

function TribesView({
  allLeads,
  onEnrich,
  onCopyEmail,
  onGenerateDemoScript,
}: {
  allLeads: Lead[];
  onEnrich: (lead: Lead) => void;
  onCopyEmail: (email: string) => void;
  onGenerateDemoScript: (lead: Lead) => void;
}) {
  const clusters = allLeads.reduce((acc, lead) => {
    const cluster = lead.useCaseCluster || "Uncategorized";
    if (!acc[cluster]) acc[cluster] = [];
    acc[cluster].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const clusterColors: Record<string, string> = {
    "E-commerce": "border-pink-400/20 bg-pink-400/5 text-pink-300",
    "B2B SaaS": "border-sky-400/20 bg-sky-400/5 text-sky-300",
    "Agency": "border-violet-400/20 bg-violet-400/5 text-violet-300",
    "Freelancer": "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
    "Enterprise": "border-white/10 bg-white/5 text-white/70",
    "Startup": "border-orange-400/20 bg-orange-400/5 text-orange-300",
    "Content Creator": "border-amber-400/20 bg-amber-400/5 text-amber-300",
    "Developer": "border-indigo-400/20 bg-indigo-400/5 text-indigo-300",
    "Marketing": "border-rose-400/20 bg-rose-400/5 text-rose-300",
    "Consulting": "border-teal-400/20 bg-teal-400/5 text-teal-300",
    "Education": "border-cyan-400/20 bg-cyan-400/5 text-cyan-300",
    "Healthcare": "border-rose-400/20 bg-rose-400/5 text-rose-300",
    "Finance": "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
    "Other": "border-white/10 bg-white/5 text-white/60",
    "Uncategorized": "border-white/10 bg-white/5 text-white/40",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Tribes overview</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(clusters).map(([cluster, leads]) => (
            <div
              key={cluster}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${clusterColors[cluster] || clusterColors["Other"]}`}
            >
              <span className="text-xs font-medium">{cluster}</span>
              <span className="text-xs opacity-70 tabular-nums">({leads.length})</span>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(clusters).map(([cluster, leads]) => (
        <div key={cluster} className="rounded-2xl border border-violet-400/20 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white text-balance">{cluster}</h4>
            <span className="text-xs text-white/40 tabular-nums">{leads.length} leads</span>
          </div>
          <div className="space-y-2">
            {leads.slice(0, 5).map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEnrich={() => onEnrich(lead)}
                onCopyEmail={() => onCopyEmail(lead.email)}
                onGenerateDemoScript={() => onGenerateDemoScript(lead)}
              />
            ))}
            {leads.length > 5 && (
              <div className="text-center py-2 text-xs text-white/40 tabular-nums">
                +{leads.length - 5} more in this tribe
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
