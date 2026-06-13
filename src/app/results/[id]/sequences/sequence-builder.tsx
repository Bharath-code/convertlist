"use client";

import { useState } from "react";
import { X, GripVertical, Plus, Trash2, Save, Sparkles } from "lucide-react";
import { SEQUENCE_TEMPLATES, type SequenceTemplate } from "@/lib/sequences/templates";

type Step = {
  id?: string;
  subject: string;
  body: string;
  delayDays: number;
  order: number;
};

type Props = {
  waitlistId: string;
  onClose: () => void;
  onSave: (name: string, steps: Step[]) => Promise<void>;
  existingSequences?: Array<{ id: string; name: string; steps: Step[] }>;
  /** Plan-derived max steps. Free=3, Pro/Launch=5, Pro+/Agency=unlimited */
  maxSteps?: number;
  senderName?: string;
  productUrl?: string;
  waitlistName?: string;
};

export default function SequenceBuilder({
  waitlistId,
  onClose,
  onSave,
  maxSteps = 5,
  senderName = "the team",
  productUrl = "https://your-product.com",
  waitlistName = "our product",
}: Props) {
  const [name, setName] = useState("My Sequence");
  const [steps, setSteps] = useState<Step[]>([
    { subject: "", body: "", delayDays: 0, order: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const fillFromTemplate = (tpl: SequenceTemplate) => {
    setName(tpl.name);
    const rendered = tpl.steps.map((s, i) => ({
      subject: s.subject
        .replace(/\{\{senderName\}\}/g, senderName)
        .replace(/\{\{productUrl\}\}/g, productUrl)
        .replace(/\{\{waitlistName\}\}/g, waitlistName),
      body: s.body
        .replace(/\{\{senderName\}\}/g, senderName)
        .replace(/\{\{productUrl\}\}/g, productUrl)
        .replace(/\{\{waitlistName\}\}/g, waitlistName),
      delayDays: s.delayDays,
      order: i,
    }));
    setSteps(rendered);
    setShowTemplates(false);
  };

  const addStep = () => {
    if (steps.length >= maxSteps) return;
    setSteps([
      ...steps,
      {
        subject: "",
        body: "",
        delayDays: steps.length === 0 ? 0 : 2,
        order: steps.length,
      },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const updateStep = (index: number, field: keyof Step, value: string | number) => {
    setSteps(
      steps.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    if (!name.trim() || steps.length === 0) return;
    setSaving(true);
    try {
      await onSave(name, steps);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Create Email Sequence</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sequence Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Hot Lead Outreach"
            />
          </div>

          {steps.length === 1 && !steps[0].subject && !steps[0].body && (
            <div>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="inline-flex items-center gap-2 text-xs font-medium text-violet-700 hover:text-violet-900 px-3 py-2 rounded-lg bg-violet-50 border border-violet-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Start from a proven template
              </button>
              {showTemplates && (
                <div className="mt-2 grid gap-2">
                  {SEQUENCE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => fillFromTemplate(tpl)}
                      className="text-left p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                    >
                      <div className="text-sm font-medium text-slate-900">
                        {tpl.name}
                        <span className="ml-2 text-xs text-slate-500 font-normal">
                          {tpl.steps.length} step{tpl.steps.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{tpl.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-slate-300" />
                    <span className="text-sm font-medium text-slate-700">
                      Step {index + 1}
                    </span>
                    {index > 0 && (
                      <span className="text-xs text-slate-500">
                        Send {step.delayDays} day{step.delayDays !== 1 ? "s" : ""} after
                        previous
                      </span>
                    )}
                  </div>
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={step.subject}
                  onChange={(e) => updateStep(index, "subject", e.target.value)}
                  className="input text-sm"
                  placeholder="Subject line"
                />

                <textarea
                  value={step.body}
                  onChange={(e) => updateStep(index, "body", e.target.value)}
                  className="input text-sm h-24 resize-none"
                  placeholder="Email body. Use {{first_name}} to personalize."
                />

                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Delay (days):</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={step.delayDays}
                      onChange={(e) =>
                        updateStep(index, "delayDays", parseInt(e.target.value) || 0)
                      }
                      className="input w-20 text-sm py-1"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {steps.length < maxSteps && (
            <button
              onClick={addStep}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-2 py-1"
            >
              <Plus className="w-4 h-4" />
              Add step
              {maxSteps < Infinity && (
                <span className="text-xs text-slate-400 ml-1">
                  ({steps.length}/{maxSteps})
                </span>
              )}
            </button>
          )}
          {steps.length >= maxSteps && maxSteps < Infinity && (
            <p className="text-xs text-slate-500">
              You've reached the {maxSteps}-step cap on your plan.{" "}
              <a href="/pricing" className="underline">
                Upgrade for more
              </a>
              .
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || steps.length === 0}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Sequence"}
          </button>
        </div>
      </div>
    </div>
  );
}
