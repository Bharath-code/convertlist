"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import EnrichmentModal from "./enrichment-modal";
import SequenceBuilder from "./sequences/sequence-builder";
import type { EnrichmentAnswers } from "./enrichment-modal";

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
  const [activeTab, setActiveTab] = useState<"HOT" | "WARM" | "COLD">("HOT");
  const [search, setSearch] = useState("");
  const [showTop10, setShowTop10] = useState(false);
  const [enrichingLead, setEnrichingLead] = useState<Lead | null>(null);
  const [showSequenceBuilder, setShowSequenceBuilder] = useState(false);

  const filteredLeads = (() => {
    const source = showTop10 ? hotLeads.slice(0, top10Percent) : getCurrentLeads();
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (l) =>
        l.email.toLowerCase().includes(q) ||
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q)
    );
  })();

  function getCurrentLeads(): Lead[] {
    if (activeTab === "HOT") return hotLeads;
    if (activeTab === "WARM") return warmLeads;
    return coldLeads;
  }

  const isFreeUser = userPlan === "FREE";
  const nearLimit = isFreeUser && waitlist.totalLeads >= 40;

  return (
    <div>
      {nearLimit && (
        <div className="card mb-6 border-2 border-amber-300 bg-amber-50 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900">
              You&apos;re at {waitlist.totalLeads}/50 leads on the free plan
            </p>
            <p className="text-sm text-amber-700">
              Upgrade to Pro for 2,000 leads/mo or Pro+ for unlimited
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
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, or company..."
              className="input pl-9"
            />
          </div>
          <button
            onClick={() => setShowTop10(!showTop10)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showTop10
                ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <Star className="w-4 h-4" />
            Top 10%
          </button>
          <button
            onClick={() => setShowSequenceBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Sequence
          </button>
        </div>

        {!showTop10 && (
          <div className="flex gap-2">
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
                >
                  <c.icon className="w-4 h-4" />
                  {c.label}
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="card text-center py-12 text-slate-500">
            No leads found
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEnrich={() => setEnrichingLead(lead)}
            />
          ))
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
                window.location.reload();
              }
            } catch (e) {
              console.error("Enrich failed:", e);
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
    </div>
  );
}

function LeadCard({ lead, onEnrich }: { lead: Lead; onEnrich: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(lead.status);

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
    <div className="card border-l-4 border-l-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900 truncate">
              {lead.name || lead.email.split("@")[0]}
            </span>
            {lead.name && (
              <span className="text-sm text-slate-500 truncate">({lead.email})</span>
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
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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
