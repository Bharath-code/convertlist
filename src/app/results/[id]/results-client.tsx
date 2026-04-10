"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  ChevronRight,
  Flame,
  Sun,
  Snowflake,
  Star,
  RefreshCw,
  Zap,
  Plus,
  ArrowRight,
  Download,
  Copy,
  Check,
  Mail,
  FileText,
  X,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Rocket,
  Target,
} from "lucide-react";
import EnrichmentModal from "./enrichment-modal";
import SequenceBuilder from "./sequences/sequence-builder";
import type { EnrichmentAnswers } from "./enrichment-modal";
import PricingIntelligenceDashboard from "@/components/pricing-intelligence-dashboard";
import LaunchDayCommandCenter from "@/components/launch-day-command-center";
import ViralityAnalyticsDashboard from "@/components/virality-analytics-dashboard";
import CompetitorInsightsDashboard from "@/components/competitor-insights-dashboard";

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

const segmentConfig = {
  HOT: {
    label: "Hot Leads",
    icon: Flame,
    bg: "bg-red-50",
    border: "border-red-200",
  },
  WARM: {
    label: "Warm Leads",
    icon: Sun,
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  COLD: {
    label: "Cold Leads",
    icon: Snowflake,
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

const statusColors: Record<string, string> = {
  UNCONTACTED: "bg-slate-100 text-slate-600",
  CONTACTED: "bg-blue-100 text-blue-700",
  REPLIED: "bg-green-100 text-green-700",
  INTERESTED: "bg-purple-100 text-purple-700",
  PAID: "bg-yellow-100 text-yellow-700",
};

export default function ResultsClient({
  waitlist,
  hotLeads,
  warmLeads,
  coldLeads,
  top10Percent,
  userPlan = "FREE",
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"HOT" | "WARM" | "COLD" | "TRIBES" | "PRICING" | "LAUNCH" | "VIRALITY" | "COMPETITORS">("HOT");
  const [search, setSearch] = useState("");
  const [showTop10, setShowTop10] = useState(false);
  const [enrichingLead, setEnrichingLead] = useState<Lead | null>(null);
  const [showSequenceBuilder, setShowSequenceBuilder] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [demoScriptLead, setDemoScriptLead] = useState<Lead | null>(null);
  const [demoScript, setDemoScript] = useState<string | null>(null);
  const [loadingDemoScript, setLoadingDemoScript] = useState(false);

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

    const fromEmail = prompt("Enter your sending email address:");
    if (!fromEmail) return;

    const loadingToast = toast.loading("Launching Instantly.ai campaign...");
    try {
      const res = await fetch("/api/instantly/launch-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlistId: waitlist.id,
          leadIds: Array.from(selectedLeads),
          fromEmail,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to launch campaign");
      }

      const data = await res.json();
      toast.success(`Campaign launched! ${data.leadsSent} emails queued`, { id: loadingToast });
      setSelectedLeads(new Set());
    } catch (error: any) {
      toast.error(error.message || "Failed to launch campaign", { id: loadingToast });
    }
  };

  const getCurrentLeads = (): Lead[] => {
    if (activeTab === "HOT") return hotLeads;
    if (activeTab === "WARM") return warmLeads;
    return coldLeads;
  };

  const isFreeUser = userPlan === "FREE";
  const nearLimit = isFreeUser && waitlist.totalLeads >= 20;

  return (
    <div>
      {nearLimit && (
        <div className="card mb-6 border-2 border-amber-300 bg-amber-50 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900">
              You&apos;re at {waitlist.totalLeads}/25 leads on the free plan
            </p>
            <p className="text-sm text-amber-700">
              Upgrade to Starter for 500 leads/mo or Pro for 5,000 leads/mo
            </p>
          </div>
          <Link href="/pricing" className="btn-primary text-sm flex items-center gap-1 flex-shrink-0">
            Upgrade <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{waitlist.name}</h1>
          <p className="text-slate-600 mt-1">
            {waitlist.totalLeads} leads &middot; {hotLeads.length} hot &middot;{" "}
            {warmLeads.length} warm &middot; {coldLeads.length} cold
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="btn-secondary text-sm flex items-center gap-1"
            aria-label="Export all leads to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link href="/dashboard" className="btn-secondary text-sm">
            &larr; Dashboard
          </Link>
          <Link href="/upload" className="btn-primary text-sm flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            New Upload
          </Link>
        </div>
      </div>

      <div className="card mb-6">
        {/* Bulk Action Bar */}
        {selectedLeads.size > 0 && (
          <div className="mb-4 p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">{selectedLeads.size} selected</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Mark as:</span>
              <button
                onClick={() => bulkMarkStatus("CONTACTED")}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Contacted
              </button>
              <button
                onClick={() => bulkMarkStatus("REPLIED")}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Replied
              </button>
              <button
                onClick={() => bulkMarkStatus("INTERESTED")}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Interested
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1" />
              <button
                onClick={launchInstantlyCampaign}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                Send via Instantly
              </button>
              <button
                onClick={() => setSelectedLeads(new Set())}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded ml-2"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, or company..."
              className="input pl-9"
              aria-label="Search leads"
            />
          </div>
          <button
            onClick={() => setShowTop10(!showTop10)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showTop10
                ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            aria-label="Toggle top 10 percent view"
          >
            <Star className="w-4 h-4" />
            Top 10%
          </button>
          <button
            onClick={() => setShowSequenceBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors"
            aria-label="Create email sequence"
          >
            <Plus className="w-4 h-4" />
            Sequence
          </button>
        </div>

        {!showTop10 && (
          <div className="flex gap-2 flex-wrap">
            {(["HOT", "WARM", "COLD"] as const).map((seg) => {
              const c = segmentConfig[seg];
              const count = seg === "HOT" ? hotLeads.length : seg === "WARM" ? warmLeads.length : coldLeads.length;
              return (
                <button
                  key={seg}
                  onClick={() => setActiveTab(seg)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    activeTab === seg
                      ? `${c.bg} border${c.border} text-slate-900`
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  aria-label={`Filter by ${c.label}`}
                >
                  <c.icon className="w-4 h-4" />
                  {c.label}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
            <button
              onClick={() => setActiveTab("TRIBES")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeTab === "TRIBES"
                  ? "bg-purple-50 border-purple-200 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              aria-label="View tribes"
            >
              <Flame className="w-4 h-4" />
              Tribes
            </button>
            <button
              onClick={() => setActiveTab("PRICING")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeTab === "PRICING"
                  ? "bg-green-50 border-green-200 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              aria-label="View pricing intelligence"
            >
              <DollarSign className="w-4 h-4" />
              Pricing
            </button>
            <button
              onClick={() => setActiveTab("LAUNCH")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeTab === "LAUNCH"
                  ? "bg-blue-50 border-blue-200 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              aria-label="View launch timing"
            >
              <Rocket className="w-4 h-4" />
              Launch
            </button>
            <button
              onClick={() => setActiveTab("VIRALITY")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeTab === "VIRALITY"
                  ? "bg-pink-50 border-pink-200 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              aria-label="View virality analytics"
            >
              <Flame className="w-4 h-4" />
              Virality
            </button>
            <button
              onClick={() => setActiveTab("COMPETITORS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeTab === "COMPETITORS"
                  ? "bg-orange-50 border-orange-200 text-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
              aria-label="View competitor insights"
            >
              <Target className="w-4 h-4" />
              Competitors
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {activeTab === "TRIBES" ? (
          <TribesView
            allLeads={[...hotLeads, ...warmLeads, ...coldLeads]}
            onEnrich={(lead) => setEnrichingLead(lead)}
            onCopyEmail={copyEmail}
            onGenerateDemoScript={(lead) => setDemoScriptLead(lead)}
          />
        ) : activeTab === "PRICING" ? (
          <PricingIntelligenceDashboard waitlistId={waitlist.id} />
        ) : activeTab === "LAUNCH" ? (
          <LaunchTimingView waitlistId={waitlist.id} />
        ) : activeTab === "VIRALITY" ? (
          <ViralityAnalyticsDashboard waitlistId={waitlist.id} />
        ) : activeTab === "COMPETITORS" ? (
          <CompetitorView waitlistId={waitlist.id} />
        ) : filteredLeads.length === 0 ? (
          <div className="card text-center py-12 text-slate-500">
            {search ? "No leads match your search" : "No leads found"}
          </div>
        ) : (
          <div className="flex gap-3 mb-2 items-center">
            <input
              type="checkbox"
              checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded border-slate-300"
              aria-label="Select all leads"
            />
            <span className="text-sm text-slate-500">
              {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : `${filteredLeads.length} leads`}
            </span>
          </div>
        )}
        {activeTab !== "TRIBES" && activeTab !== "PRICING" && activeTab !== "LAUNCH" && activeTab !== "VIRALITY" && activeTab !== "COMPETITORS" && filteredLeads.map((lead) => (
          <div key={lead.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedLeads.has(lead.id)}
              onChange={() => toggleSelectLead(lead.id)}
              className="w-4 h-4 rounded border-slate-300 mt-1"
              aria-label={`Select ${lead.email}`}
            />
            <LeadCard
              lead={lead}
              onEnrich={() => setEnrichingLead(lead)}
              onCopyEmail={() => copyEmail(lead.email)}
              onGenerateDemoScript={() => setDemoScriptLead(lead)}
            />
          </div>
        ))}
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
    <div className="card border-l-4 border-l-slate-900 flex-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-slate-900 truncate">
              {lead.name || lead.email.split("@")[0]}
            </span>
            {lead.name && (
              <span className="text-sm text-slate-500 truncate">({lead.email})</span>
            )}
            {!lead.name && (
              <button
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={`Copy ${lead.email} to clipboard`}
                title="Copy email"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {lead.company && (
            <p className="text-sm text-slate-600 mb-1">{lead.company}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold ${
                lead.segment === "HOT"
                  ? "bg-red-100 text-red-700"
                  : lead.segment === "WARM"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {lead.score}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                lead.confidence === "HIGH"
                  ? "bg-green-100 text-green-700"
                  : lead.confidence === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {lead.confidence}
            </span>
            <span className="text-xs text-slate-500">{lead.reason}</span>
            
            {/* Enrichment badges */}
            {lead.companySize && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                {lead.companySize}
              </span>
            )}
            {lead.techStack && (
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {lead.techStack.split(',').slice(0, 2).join(', ')}
              </span>
            )}
            {lead.fundingStatus && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                {lead.fundingStatus}
              </span>
            )}
            {lead.socialProofScore && lead.socialProofScore > 50 && (
              <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                🔥 {lead.socialProofScore}
              </span>
            )}
            
            {/* Competitor badges */}
            {lead.detectedCompetitors && (
              <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-1">
                🎯 {JSON.parse(lead.detectedCompetitors).slice(0, 2).join(', ')}
              </span>
            )}
            
            {/* Network relationship badges */}
            {lead.influenceScore && lead.influenceScore > 70 && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                ⭐ Influencer ({lead.influenceScore})
              </span>
            )}
            {lead.relatedLeads && JSON.parse(lead.relatedLeads).length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 flex items-center gap-1">
                🔗 {JSON.parse(lead.relatedLeads).length} connections
              </span>
            )}
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              {lead.signupNote && (
                <p className="text-sm text-slate-600 italic">
                  &ldquo;{lead.signupNote}&rdquo;
                </p>
              )}
              {lead.source && (
                <p className="text-xs text-slate-500">Source: {lead.source}</p>
              )}
              {/* Clustering info */}
              <div className="flex flex-wrap gap-2 mt-2">
                {lead.useCaseCluster && (
                  <span className="text-xs px-2 py-1 rounded bg-cyan-100 text-cyan-700">
                    {lead.useCaseCluster}
                  </span>
                )}
                {lead.painPointTribe && (
                  <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                    {lead.painPointTribe}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onGenerateDemoScript}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
            title="Generate AI demo script"
          >
            <FileText className="w-3 h-3" />
            Demo Script
          </button>
          <button
            onClick={onEnrich}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
            title="Improve score accuracy"
          >
            <Zap className="w-3 h-3" />
            Improve
          </button>

          <span
            className={`text-xs px-2 py-1 rounded font-medium hidden sm:inline ${
              statusColors[status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {status}
          </span>

          {nextStatus[status] && (
            <button
              onClick={() => handleStatusChange(nextStatus[status]!)}
              disabled={updating}
              className="text-xs px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {updating ? "..." : `Mark ${nextStatus[status]}`}
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Demo Script</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{lead.name || lead.email}</p>
            {lead.company && <p className="text-sm text-slate-600">{lead.company}</p>}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Generating demo script...
            </div>
          ) : script ? (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-4 rounded-lg">{script}</pre>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No demo script available
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between p-4 border-t bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFeedback(true)}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded border border-slate-200 hover:bg-green-50 hover:border-green-300 transition-colors"
              title="Helpful"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onFeedback(false)}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded border border-slate-200 hover:bg-red-50 hover:border-red-300 transition-colors"
              title="Not helpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              disabled={!script}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
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

  if (loading) return <div className="card p-6">Loading launch timing data...</div>;
  if (!data) return <div className="card p-6">No launch timing data available</div>;

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

  if (loading) return <div className="card p-6">Loading competitor data...</div>;
  if (!data) return <div className="card p-6">No competitor data available</div>;

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
    "E-commerce": "bg-pink-50 border-pink-200",
    "B2B SaaS": "bg-blue-50 border-blue-200",
    "Agency": "bg-purple-50 border-purple-200",
    "Freelancer": "bg-green-50 border-green-200",
    "Enterprise": "bg-slate-50 border-slate-200",
    "Startup": "bg-orange-50 border-orange-200",
    "Content Creator": "bg-yellow-50 border-yellow-200",
    "Developer": "bg-indigo-50 border-indigo-200",
    "Marketing": "bg-red-50 border-red-200",
    "Consulting": "bg-teal-50 border-teal-200",
    "Education": "bg-cyan-50 border-cyan-200",
    "Healthcare": "bg-rose-50 border-rose-200",
    "Finance": "bg-emerald-50 border-emerald-200",
    "Other": "bg-gray-50 border-gray-200",
    "Uncategorized": "bg-gray-100 border-gray-300",
  };

  return (
    <div className="space-y-4">
      <div className="card p-4 bg-purple-50 border-purple-200">
        <h3 className="font-semibold text-slate-900 mb-2">Tribes Overview</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(clusters).map(([cluster, leads]) => (
            <div
              key={cluster}
              className={`px-3 py-1.5 rounded-lg border ${clusterColors[cluster] || clusterColors["Other"]}`}
            >
              <span className="font-medium">{cluster}</span>
              <span className="ml-2 text-sm opacity-70">({leads.length})</span>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(clusters).map(([cluster, leads]) => (
        <div key={cluster} className="card border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900">{cluster}</h4>
            <span className="text-sm text-slate-500">{leads.length} leads</span>
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
              <div className="text-center py-2 text-sm text-slate-500">
                +{leads.length - 5} more leads in this tribe
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
