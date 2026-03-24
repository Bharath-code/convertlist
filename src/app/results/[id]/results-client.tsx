"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const exportToCSV = () => {
    const allLeads = [...hotLeads, ...warmLeads, ...coldLeads];
    const headers = ["email", "name", "company", "score", "confidence", "segment", "status", "source", "reason"];
    const csv = [
      headers.join(","),
      ...allLeads.map((lead) =>
        headers.map((h) => `"${(lead as any)[h]?.replace(/"/g, '""') || ""}"`).join(",")
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
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error("Failed to update leads", { id: loadingToast });
    }
  };

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
                  aria-label={`Filter by ${c.label}`}
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
        {filteredLeads.map((lead) => (
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

function LeadCard({ lead, onEnrich, onCopyEmail }: { lead: Lead; onEnrich: () => void; onCopyEmail: () => void }) {
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
