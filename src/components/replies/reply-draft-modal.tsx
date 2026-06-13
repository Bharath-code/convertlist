"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, RefreshCw, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { draftReplyToLead } from "@/app/actions/draft-reply";

interface Props {
  open: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string | null;
  leadEmail: string;
  replyText: string;
  initialIntent?: "interested" | "unsubscribe" | "out_of_office" | "objection" | "other";
}

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "curious", label: "Curious" },
] as const;

const INTENT_META: Record<string, { label: string; tint: string; ring: string; chip: string }> = {
  interested: { label: "Looks interested", tint: "text-emerald-300", ring: "ring-emerald-400/20", chip: "bg-emerald-400/10 text-emerald-300" },
  unsubscribe: { label: "Wants to unsubscribe", tint: "text-rose-300", ring: "ring-rose-400/20", chip: "bg-rose-400/10 text-rose-300" },
  out_of_office: { label: "Out of office", tint: "text-amber-300", ring: "ring-amber-400/20", chip: "bg-amber-400/10 text-amber-300" },
  objection: { label: "Has an objection", tint: "text-orange-300", ring: "ring-orange-400/20", chip: "bg-orange-400/10 text-orange-300" },
  other: { label: "Reply received", tint: "text-white/60", ring: "ring-white/10", chip: "bg-white/5 text-white/60" },
};

export function ReplyDraftModal({ open, onClose, leadId, leadName, leadEmail, replyText, initialIntent }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [intent, setIntent] = useState(initialIntent ?? null);
  const [tone, setTone] = useState<typeof TONES[number]["id"]>("professional");
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const generate = () => {
    startTransition(async () => {
      const result = await draftReplyToLead({ leadId, replyText, tone });
      if (!result.ok) {
        toast.error(result.error || "Could not draft reply");
        return;
      }
      setDraft(result.draft ?? null);
      if (result.intent) setIntent(result.intent);
    });
  };

  const copy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success("Copied to clipboard", { duration: 2000 });
    window.setTimeout(() => setCopied(false), 1500);
  };

  const intentMeta = intent ? INTENT_META[intent] : null;
  const displayName = leadName || leadEmail.split("@")[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-1.5 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="rounded-[1.625rem] border border-white/[0.06] bg-[#0a0a0a] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3">
                      <Sparkles className="w-3 h-3" />
                      AI-drafted follow-up
                    </div>
                    <h2 className="text-xl font-medium text-white tracking-tight text-balance">
                      Reply to {displayName}?
                    </h2>
                    <p className="text-sm text-white/50 mt-1">
                      {leadEmail} · {replyText.slice(0, 80)}{replyText.length > 80 ? "…" : ""}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="shrink-0 size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-300 active:scale-[0.96]"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Intent chip */}
                {intentMeta && (
                  <div className="mb-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${intentMeta.chip}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {intentMeta.label}
                    </span>
                  </div>
                )}

                {/* Their reply */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mb-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Their reply</div>
                  <p className="text-sm text-white/80 leading-relaxed max-h-32 overflow-y-auto">
                    {replyText}
                  </p>
                </div>

                {/* Tone selector */}
                <div className="mb-5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Tone</div>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1 gap-1">
                    {TONES.map((t) => {
                      const active = tone === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTone(t.id)}
                          className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            active ? "text-black" : "text-white/50 hover:text-white/80"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="tone-pill"
                              className="absolute inset-0 rounded-full bg-white"
                              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                            />
                          )}
                          <span className="relative z-10">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Draft output */}
                {draft ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="mb-5"
                  >
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Draft</div>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-4">
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{draft}</p>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={generate}
                    disabled={pending}
                    className="group w-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left hover:border-emerald-400/30 hover:bg-emerald-400/[0.03] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-br from-emerald-400/30 to-violet-400/20 border border-white/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {pending ? "Drafting…" : "Draft a follow-up"}
                        </div>
                        <div className="text-xs text-white/50 mt-0.5">
                          {pending ? "AI is reading the reply" : "AI will write a 2-3 sentence follow-up"}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Actions */}
                {draft && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={copy}
                      className="group flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.98]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy to send
                        </>
                      )}
                    </button>
                    <button
                      onClick={generate}
                      disabled={pending}
                      className="size-12 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-[0.96] disabled:opacity-50"
                      aria-label="Regenerate"
                    >
                      <RefreshCw className={`w-4 h-4 ${pending ? "animate-spin" : ""}`} />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
