"use client";

import { useState } from "react";
import { X, Zap, Loader2 } from "lucide-react";

type Props = {
  lead: {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    score: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
  };
  onClose: () => void;
  onSubmit: (answers: EnrichmentAnswers) => Promise<void>;
};

export type EnrichmentAnswers = {
  urgency: "low" | "medium" | "high";
  budget: "none" | "small" | "significant" | "enterprise";
  role: "founder" | "employee" | "manager" | "other";
  timeline: "exploring" | "soon" | "immediate" | "already_paid";
};

export default function EnrichmentModal({ lead, onClose, onSubmit }: Props) {
  const [urgency, setUrgency] = useState<EnrichmentAnswers["urgency"] | null>(null);
  const [budget, setBudget] = useState<EnrichmentAnswers["budget"] | null>(null);
  const [role, setRole] = useState<EnrichmentAnswers["role"] | null>(null);
  const [timeline, setTimeline] = useState<EnrichmentAnswers["timeline"] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = urgency && budget && role && timeline;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      await onSubmit({ urgency: urgency!, budget: budget!, role: role!, timeline: timeline! });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const scoreBoost = (() => {
    let boost = 0;
    if (urgency === "high") boost += 10;
    else if (urgency === "medium") boost += 5;
    if (budget === "significant" || budget === "enterprise") boost += 8;
    else if (budget === "small") boost += 4;
    if (timeline === "immediate" || timeline === "already_paid") boost += 10;
    else if (timeline === "soon") boost += 5;
    if (role === "founder") boost += 5;
    return boost;
  })();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Improve Score Accuracy</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <p className="text-sm text-slate-600">
            Answer a few quick questions about <strong>{lead.name || lead.email}</strong> to
            improve their score and get better outreach recommendations.
          </p>

          <Question<EnrichmentAnswers["urgency"]>
            label="How urgent is their need?"
            options={[
              { value: "high", label: "Critical / I'm losing deals" },
              { value: "medium", label: "Active interest" },
              { value: "low", label: "Just exploring" },
            ]}
            selected={urgency}
            onSelect={(v) => setUrgency(v)}
          />

          <Question<EnrichmentAnswers["budget"]>
            label="What's their likely budget?"
            options={[
              { value: "enterprise", label: "Enterprise ($10k+/mo)" },
              { value: "significant", label: "Significant ($1-10k/mo)" },
              { value: "small", label: "Small (< $1k/mo)" },
              { value: "none", label: "Unknown / None" },
            ]}
            selected={budget}
            onSelect={(v) => setBudget(v)}
          />

          <Question<EnrichmentAnswers["role"]>
            label="What's their role?"
            options={[
              { value: "founder", label: "Founder / CEO" },
              { value: "manager", label: "Manager" },
              { value: "employee", label: "Employee" },
              { value: "other", label: "Other" },
            ]}
            selected={role}
            onSelect={(v) => setRole(v)}
          />

          <Question<EnrichmentAnswers["timeline"]>
            label="What's their timeline?"
            options={[
              { value: "already_paid", label: "Already paying for something similar" },
              { value: "immediate", label: "Ready to buy now" },
              { value: "soon", label: "Planning to buy in 1-3 months" },
              { value: "exploring", label: "Just exploring options" },
            ]}
            selected={timeline}
            onSelect={(v) => setTimeline(v)}
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          {allAnswered && (
            <p className="text-sm text-slate-600 mb-3">
              Estimated score boost: <strong className="text-green-600">+{scoreBoost} points</strong>
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {submitting ? "Updating..." : "Update Score"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Question<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors ${
              selected === opt.value
                ? "border-slate-900 bg-slate-50 text-slate-900"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
